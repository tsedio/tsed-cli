import {type CliDefaultOptions, Command, command, type CommandData, type CommandProvider, inject} from "@tsed/cli-core";

import {CliPrisma} from "../services/CliPrisma.js";

export interface PrismaContext extends CommandData {
  command: string;
}

export class PrismaCmd implements CommandProvider {
  protected cli = inject(CliPrisma);

  $exec(ctx: PrismaContext) {
    return [
      {
        title: `Run Prisma CLI ${ctx.command}`,
        task: () => this.cli.run(ctx.command, ctx.rawArgs)
      }
    ];
  }
}

command({
  token: PrismaCmd,
  name: "prisma",
  description: "Run a prisma command",
  args: {
    command: {
      description: "The prisma command",
      type: String,
      required: true
    }
  },
  options: {},
  allowUnknownOption: true
});
