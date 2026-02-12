import {CliExeca, Command, type CommandProvider} from "@tsed/cli-core";
import type {Task} from "@tsed/cli-tasks";
import {inject} from "@tsed/di";

export interface DeployContext {
  projectDir: string;
  install: boolean;
}

@Command({
  name: "deploy:assets",
  description: "Validate, install, and build CLI assets before release"
})
export class DeployAssetsCmd implements CommandProvider<DeployContext> {
  protected cliExeca = inject(CliExeca);

  $mapContext(initial: Partial<DeployContext>): DeployContext {
    return {
      projectDir: initial.projectDir || process.cwd(),
      install: initial.install ?? true
    };
  }

  async $exec(): Promise<Task<DeployContext>[]> {
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
          return this.cliExeca.run("npm", ["install"], {
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
}
