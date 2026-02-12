import {mkdir, writeFile} from "node:fs/promises";
import {join} from "node:path";

import {CliExeca, Command, type CommandProvider} from "@tsed/cli-core";
import type {PromptQuestion} from "@tsed/cli-prompts";
import type {Task} from "@tsed/cli-tasks";
import {inject} from "@tsed/di";

type Runtime = "node" | "bun";

export interface WelcomeContext {
  projectName: string;
  runtime: Runtime;
  installDeps: boolean;
}

@Command({
  name: "interactive:welcome",
  description: "Guide developers through project bootstrap with prompts and tasks"
})
export class InteractiveWelcome implements CommandProvider<WelcomeContext> {
  protected cliExeca = inject(CliExeca);

  async $prompt(initial: Partial<WelcomeContext>): Promise<PromptQuestion[]> {
    return [
      {
        type: "input",
        name: "projectName",
        message: "Project name",
        default: initial.projectName || "awesome-cli",
        validate(value) {
          return value?.trim() ? undefined : "Project name is required (letters, numbers, and dashes are allowed)";
        }
      },
      {
        type: "list",
        name: "runtime",
        message: "Choose a runtime",
        choices: [
          {name: "Node.js", value: "node"},
          {name: "Bun", value: "bun"}
        ],
        default: initial.runtime || "node"
      },
      {
        type: "confirm",
        name: "installDeps",
        message: "Install dependencies after generating files?",
        default: true
      }
    ];
  }

  $mapContext(ctx: Partial<WelcomeContext>): WelcomeContext {
    return {
      projectName: ctx.projectName?.trim() || "awesome-cli",
      runtime: (ctx.runtime as Runtime) || "node",
      installDeps: ctx.installDeps ?? true
    };
  }

  async $exec(ctx: WelcomeContext): Promise<Task<WelcomeContext>[]> {
    return [
      {
        title: "Create workspace",
        task: async (context, logger) => {
          const destination = join(process.cwd(), context.projectName);
          await mkdir(destination, {recursive: true});
          await writeFile(join(destination, "README.md"), `# ${context.projectName}\n\nGenerated with the Ts.ED CLI runtime.\n`);
          logger.message(`Workspace ready at ${destination}`);
        }
      },
      {
        title: "Install dependencies",
        skip: (context) => (!context.installDeps ? "Skipped by --no-install flag" : false),
        task: async (context, logger) => {
          logger.message("Installing packages (this may take a minute)...");

          const packageManager = context.runtime === "bun" ? "bun" : "npm";

          return this.cliExeca.run(packageManager, ["install"], {
            cwd: join(process.cwd(), context.projectName)
          });
        }
      }
    ];
  }
}
