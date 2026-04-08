import {spawn} from "node:child_process";
import {existsSync} from "node:fs";
import path from "node:path";
import process from "node:process";
import {fileURLToPath, pathToFileURL} from "node:url";

const runnerFile = fileURLToPath(import.meta.url);
const configFile = path.resolve(path.dirname(runnerFile), "../../vite.config.ts");
const RUN_MODE = "TSED_VITE_RUN_MODE";

function parseWatchValue(args: string[]) {
  if (args.includes("--no-watch")) {
    return false;
  }

  const watchIndex = args.findIndex((arg) => arg === "--watch" || arg.startsWith("--watch="));

  if (watchIndex === -1) {
    return true;
  }

  const watchArg = args[watchIndex];

  if (watchArg === "--watch") {
    const nextValue = args[watchIndex + 1];

    if (!nextValue || nextValue.startsWith("-")) {
      return true;
    }

    return nextValue !== "false";
  }

  if (watchArg === "--watch=false") {
    return false;
  }

  if (watchArg === "--watch=true") {
    return true;
  }

  return true;
}

function assertViteProject() {
  if (!existsSync(configFile)) {
    throw new Error("tsed dev is only available for ViteRuntime projects. Missing vite.config.ts in the current directory.");
  }
}

async function createViteDevServer() {
  // @ts-ignore
  const {createServer} = await import("vite");

  return createServer({
    configFile,
    server: {
      middlewareMode: "ssr" as any,
      hmr: false,
      ws: false
    }
  });
}

async function runViteApp() {
  const vite = await createViteDevServer();

  const shutdown = async () => {
    await vite.close();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  await vite.ssrLoadModule("/src/index.ts");
  await new Promise(() => {});
}

async function runViteController(rawArgs: string[]) {
  const watch = parseWatchValue(rawArgs);
  const vite = await createViteDevServer();
  let childProcess: ReturnType<typeof spawn> | undefined;
  let childStarted = false;
  let restarting = false;
  let queued = false;

  const startChild = () => {
    if (childStarted) {
      return;
    }

    childStarted = true;
    childProcess = spawn(process.execPath, [runnerFile, ...rawArgs], {
      env: {
        ...process.env,
        [RUN_MODE]: "app"
      },
      stdio: "inherit"
    });

    childProcess.once("exit", () => {
      childStarted = false;
      childProcess = undefined;
    });
  };

  const stopChild = async () => {
    if (!childProcess || childProcess.killed || childProcess.exitCode !== null || childProcess.signalCode !== null) {
      childStarted = false;
      childProcess = undefined;
      return;
    }

    await new Promise((resolve) => {
      childProcess!.once("exit", resolve);
      childProcess!.kill("SIGTERM");
    });

    childStarted = false;
  };

  const restartChild = async (reason: string, file = "") => {
    if (restarting) {
      queued = true;
      return;
    }

    restarting = true;
    const suffix = file ? `: ${file}` : "";
    vite.config.logger.info(`[tsed-dev] restart (${reason})${suffix}`);

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

  // Fallback: some environments can miss/lag watcher "ready" when Vite re-optimizes deps.
  setTimeout(() => {
    if (!childStarted) {
      startChild();
    }
  }, 2500);

  const shutdown = async () => {
    await stopChild();
    await vite.close();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  await new Promise(() => {});
}

export async function dev(rawArgs: string[] = process.argv.slice(2)) {
  if (process.env[RUN_MODE] === "app") {
    await runViteApp();
    return;
  }

  await runViteController(rawArgs);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  dev().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
