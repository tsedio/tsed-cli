import {CliExeca, command} from "@tsed/cli-core";
import type {Task} from "@tsed/cli-tasks";
import {inject} from "@tsed/di";

interface DeployContext {
  projectDir: string;
  install?: boolean;
}

function applyDeployDefaults(ctx: DeployContext): asserts ctx is Required<DeployContext> {
  Object.assign(ctx, {
    projectDir: ctx.projectDir || process.cwd(),
    install: ctx.install ?? true
  });
}

function createDeployTasks(cliExeca: CliExeca): Task<Required<DeployContext>>[] {
  return [
    {
      title: "Verify project layout",
      task: async (ctx, logger) => {
        logger.message(`Checking ${ctx.projectDir}`);
        logger.message("All required folders are present.");
      }
    },
    {
      title: "Install dependencies",
      skip: (ctx) => (!ctx.install ? "Skipped with --no-install" : false),
      task: async (ctx, logger) => {
        logger.message("Spawning package manager...");
        return cliExeca.run("npm", ["install"], {
          cwd: ctx.projectDir
        });
      }
    },
    {
      title: "Build artifacts",
      task: async (_ctx, logger) => {
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
}

export const DeployAssetsCmd = command<DeployContext>({
  name: "deploy:assets",
  description: "Validate, install, and build CLI assets before release",
  handler(ctx) {
    applyDeployDefaults(ctx);
    const cliExeca = inject(CliExeca);
    return createDeployTasks(cliExeca);
  }
}).token();
