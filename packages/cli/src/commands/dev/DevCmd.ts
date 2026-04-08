import {spawn} from "node:child_process";
import process from "node:process";

import {command, type CommandProvider, normalizePath} from "@tsed/cli-core";
import {taskLogger} from "@tsed/cli-tasks";

export interface DevCmdContext {
  rawArgs: string[];
}

export class DevCmd implements CommandProvider {
  async $exec(ctx: DevCmdContext) {
    await this.runViteDev(ctx.rawArgs);
  }

  protected parseWatchValue(args: string[]) {
    const watchArg = args.find((arg) => arg === "--watch" || arg.startsWith("--watch="));

    if (!watchArg) {
      return true;
    }

    if (watchArg === "--watch") {
      return true;
    }

    return watchArg !== "--watch=false";
  }

  protected async createViteDevServer() {
    const {createServer} = await import("vite");

    return createServer({
      configFile: normalizePath("vite.config.ts"),
      server: {
        middlewareMode: true,
        hmr: false,
        ws: false
      }
    });
  }

  protected async runViteApp() {
    const vite = await this.createViteDevServer();

    const shutdown = async () => {
      await vite.close();
      process.exit(0);
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);

    await vite.ssrLoadModule(`/src/index.ts?t=${Date.now()}`);
    await new Promise(() => {});
  }

  protected async runViteController(rawArgs: string[]) {
    const watch = this.parseWatchValue(rawArgs);
    const vite = await this.createViteDevServer();
    let childProcess: ReturnType<typeof spawn> | undefined;
    let restarting = false;
    let queued = false;

    const startChild = () => {
      const [, scriptPath] = process.argv;
      const args = scriptPath ? [scriptPath, "dev", ...rawArgs] : ["dev", ...rawArgs];

      childProcess = spawn(process.execPath, args, {
        env: {
          ...process.env,
          TSED_VITE_RUN_MODE: "app"
        },
        stdio: "inherit"
      });
    };

    const stopChild = async () => {
      if (!childProcess || childProcess.killed) {
        return;
      }

      await new Promise((resolve) => {
        childProcess!.once("exit", resolve);
        childProcess!.kill("SIGTERM");
      });
    };

    const restartChild = async (reason: string, file = "") => {
      if (restarting) {
        queued = true;
        return;
      }

      restarting = true;
      const suffix = file ? `: ${file}` : "";
      taskLogger().info(`[tsed-dev] restart (${reason})${suffix}`);
      await stopChild();
      startChild();
      restarting = false;

      if (queued) {
        queued = false;
        await restartChild("queued");
      }
    };

    if (watch) {
      vite.watcher.on("all", async (event, file) => {
        if (!file || file.includes("node_modules") || file.includes(".git") || file.includes("/dist/")) {
          return;
        }

        if (["add", "change", "unlink"].includes(event)) {
          await restartChild(event, file);
        }
      });
    }

    vite.watcher.once("ready", () => {
      startChild();
    });

    const shutdown = async () => {
      await stopChild();
      await vite.close();
      process.exit(0);
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);

    await new Promise(() => {});
  }

  protected async runViteDev(rawArgs: string[]) {
    if (process.env.TSED_VITE_RUN_MODE === "app") {
      await this.runViteApp();
      return;
    }

    await this.runViteController(rawArgs);
  }
}

command({
  token: DevCmd,
  name: "dev",
  description: "Run the project in development mode",
  allowUnknownOption: true
});
