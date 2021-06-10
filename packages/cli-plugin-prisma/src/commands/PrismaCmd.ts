import {Command, CliDefaultOptions, CommandProvider, Inject} from "@tsed/cli-core";
import {CliPrisma} from "../services/CliPrisma";

export interface PrismaContext extends CliDefaultOptions {
  command: string;
}

@Command({
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
})
export class PrismaCmd implements CommandProvider {
  @Inject()
  cli: CliPrisma;

  async $exec(ctx: PrismaContext) {
    return [
      {
        title: `Run Prisma CLI ${ctx.command}`,
        task: () => this.cli.run(ctx.command, ctx.rawArgs)
      }
    ];
  }
}
