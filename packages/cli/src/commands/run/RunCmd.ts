import {CliFs, CliRunScript, Command, CommandProvider, normalizePath, ProjectPackageJson, Tasks} from "@tsed/cli-core";
import {Inject} from "@tsed/di";
import {join} from "path";

export interface RunCmdContext {
  production: boolean;
  command: string;
  rawArgs: string[];
}

@Command({
  name: "run",
  description: "Run a project level command",
  args: {
    command: {
      description: "The project command",
      type: String,
      required: true
    }
  },
  options: {
    "-p, --production": {
      type: Boolean,
      defaultValue: false,
      description: "Set production profile to NODE_ENV"
    }
  },
  allowUnknownOption: true
})
export class RunCmd implements CommandProvider {
  @Inject()
  fs: CliFs;

  @Inject()
  projectPackageJson: ProjectPackageJson;

  @Inject()
  runScript: CliRunScript;

  async $exec(ctx: RunCmdContext): Promise<Tasks> {
    const cmd = "node";
    const args = ["--import", "@swc-node/register/register-esm"];
    const path = normalizePath("src/bin/index.ts");

    await this.runScript.run(cmd, [...args, path, ctx.command, ...ctx.rawArgs], {
      env: process.env
    });

    return [];
  }
}
