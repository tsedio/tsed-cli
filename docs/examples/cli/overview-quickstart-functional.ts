import {mkdir, writeFile} from "node:fs/promises";
import {join} from "node:path";

import {command} from "@tsed/cli-core";
import type {Task} from "@tsed/cli-tasks";
import {s} from "@tsed/schema";
import {execa} from "execa";

type Runtime = "node" | "bun";

export interface WelcomeContext {
  projectName: string;
  runtime: Runtime;
  installDeps: boolean;
}

const WelcomeSchema = s.object({
  projectName: s.string().prompt("Project name").default("awesome-cli"),
  runtime: s
    .enums<Runtime>(["node", "bun"])
    .prompt("Choose a runtime")
    .choices([
      {label: "Node.js", value: "node"},
      {label: "Bun", value: "bun"}
    ])
    .default("node"),
  installDeps: s.boolean().prompt("Install dependencies after generating files?").default(true)
});

export const InteractiveWelcome = command<WelcomeContext>({
  name: "interactive:welcome",
  description: "Guide developers through project bootstrap with prompts and tasks",
  inputSchema: WelcomeSchema,
  async handler(context): Promise<Task<WelcomeContext>[]> {
    return [
      {
        title: "Create workspace",
        task: async (ctx, logger) => {
          const destination = join(process.cwd(), ctx.projectName);
          await mkdir(destination, {recursive: true});
          await writeFile(join(destination, "README.md"), `# ${ctx.projectName}\n\nGenerated with the Ts.ED CLI runtime.\n`);
          logger.message(`Workspace ready at ${destination}`);
        }
      },
      {
        title: "Install dependencies",
        skip: (ctx) => (!ctx.installDeps ? "Skipped by --no-install flag" : false),
        task: async (ctx, logger) => {
          logger.message("Installing packages (this may take a minute)...");
          const packageManager = ctx.runtime === "bun" ? "bun" : "npm";
          const installArgs = ["install"];
          const subprocess = execa(packageManager, installArgs, {
            cwd: join(process.cwd(), ctx.projectName)
          });

          subprocess.stdout?.on("data", (chunk) => logger.info(chunk.toString().trim()));
          subprocess.stderr?.on("data", (chunk) => logger.warn(chunk.toString().trim()));

          await subprocess;
          logger.message("Dependencies installed");
        }
      }
    ];
  }
}).token();
