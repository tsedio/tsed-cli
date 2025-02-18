import {CliFs, CliRunScript, Command, type CommandProvider, inject, normalizePath, ProjectPackageJson, type Tasks} from "@tsed/cli-core";

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
  protected fs = inject(CliFs);
  protected projectPackageJson = inject(ProjectPackageJson);
  protected runScript = inject(CliRunScript);

  async $exec(ctx: RunCmdContext): Promise<Tasks> {
    const cmd = "node";
    const args = ["--import", "@swc-node/register/esm-register"];
    const path = normalizePath("src/bin/index.ts");

    await this.runScript.run(cmd, [...args, path, ctx.command, ...ctx.rawArgs], {
      env: process.env
    });

    return [];
  }
}
