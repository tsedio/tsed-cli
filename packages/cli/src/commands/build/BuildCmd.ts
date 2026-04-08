import {command, type CommandProvider, inject} from "@tsed/cli-core";
import {taskLogger} from "@tsed/cli-tasks";

import {CliRunScript} from "../../services/CliRunScript.js";

export interface BuildCmdContext {
  rawArgs: string[];
}

export class BuildCmd implements CommandProvider {
  protected runScript = inject(CliRunScript);

  async $exec(ctx: BuildCmdContext) {
    const command = "vite build";

    taskLogger().info(`Run ${[command, ...ctx.rawArgs].join(" ")}`);
    await this.runScript.run(command, ctx.rawArgs, {
      env: process.env
    });
  }
}

command({
  token: BuildCmd,
  name: "build",
  description: "Build the project",
  allowUnknownOption: true
});
