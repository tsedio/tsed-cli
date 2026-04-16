import {spawn} from "node:child_process";
import path from "node:path";
import process from "node:process";
import {fileURLToPath} from "node:url";

import {createServer} from "vite";

const RUN_MODE = process.env.TSED_VITE_RUN_MODE || "controller";
const runnerFile = fileURLToPath(import.meta.url);
const configFile = path.resolve(path.dirname(runnerFile), "../../vite.config.ts");

function parseWatchValue(args) {
  if (args.includes("--no-watch")) return false;

  const watchIndex = args.findIndex((arg) => arg === "--watch" || arg.startsWith("--watch="));
  if (watchIndex === -1) return true;

  const watchArg = args[watchIndex];
  if (watchArg === "--watch") {
    const nextValue = args[watchIndex + 1];
    if (!nextValue || nextValue.startsWith("-")) return true;
    return nextValue !== "false";
  }

  if (watchArg === "--watch=false") return false;
  if (watchArg === "--watch=true") return true;
  return true;
}

async function createViteDevServer() {
  return createServer({
    configFile,
    server: {
      middlewareMode: "ssr",
      hmr: false,
      ws: false
    }
  });
}

async function runApp() {
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

async function runController(rawArgs) {
  const watch = parseWatchValue(rawArgs);
  const vite = await createViteDevServer();

  let childProcess;
  let childStarted = false;
  let restarting = false;
  let queued = false;

  const startChild = () => {
    if (childStarted) return;

    childStarted = true;
    childProcess = spawn(process.execPath, [runnerFile, ...rawArgs], {
      env: {
        ...process.env,
        TSED_VITE_RUN_MODE: "app"
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
      childProcess.once("exit", resolve);
      childProcess.kill("SIGTERM");
    });

    childStarted = false;
  };

  const restartChild = async (reason, file = "") => {
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
      if (!file || file.includes("node_modules") || file.includes(".git") || file.includes("/dist/")) return;
      if (["add", "change", "unlink"].includes(event)) {
        await restartChild(event, file);
      }
    });
  }

  vite.watcher.once("ready", () => {
    startChild();
  });

  setTimeout(() => {
    if (!childStarted) startChild();
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

async function run() {
  const rawArgs = process.argv.slice(2);

  if (RUN_MODE === "app") {
    await runApp();
    return;
  }

  await runController(rawArgs);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
