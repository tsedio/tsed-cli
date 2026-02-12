import type {Task} from "@tsed/cli-tasks";
import {execa} from "execa";

export interface DeployContext {
  projectDir: string;
  install: boolean;
  onCancel(handler: () => void): void;
}

export function createDeployContext(projectDir: string): DeployContext {
  const cancelHandlers = new Set<() => void>();

  const invokeCancellation = () => cancelHandlers.forEach((handler) => handler());

  process.once("SIGINT", invokeCancellation);

  return {
    projectDir,
    install: true,
    onCancel(handler) {
      cancelHandlers.add(handler);
    }
  };
}

export const deployTasks: Task<DeployContext>[] = [
  {
    title: "Verify project layout",
    task: async (ctx, logger) => {
      logger.message(`Checking ${ctx.projectDir}`);
      // expensive validation omitted for brevity
      logger.message("All required folders are present.");
    }
  },
  {
    title: "Install dependencies",
    skip: (ctx) => (!ctx.install ? "Skipped with --no-install" : false),
    task: async (ctx, logger) => {
      logger.message("Spawning package manager...");
      const subprocess = execa("npm", ["install"], {
        cwd: ctx.projectDir
      });

      ctx.onCancel(() => {
        logger.warn("Cancelling installation (Ctrl+C received)");
        subprocess.kill("SIGINT");
      });

      subprocess.stdout?.on("data", (chunk) => logger.info(chunk.toString().trim()));
      subprocess.stderr?.on("data", (chunk) => logger.warn(chunk.toString().trim()));

      await subprocess;
      logger.message("Dependencies installed");
    }
  },
  {
    title: "Build artifacts",
    task: async (ctx, logger) => {
      const steps = ["Bundle commands", "Emit type definitions", "Copy templates"];

      for (let index = 0; index < steps.length; index++) {
        const message = `${steps[index]} (${index + 1}/${steps.length})`;
        logger.message(message);
        await new Promise((resolve) => setTimeout(resolve, 250));
      }

      logger.message("Artifacts ready");
    }
  }
];
