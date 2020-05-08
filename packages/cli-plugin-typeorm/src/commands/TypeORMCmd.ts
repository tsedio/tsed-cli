import {Command, CliDefaultOptions, CommandProvider, Inject} from "@tsed/cli-core";
import {CliTypeORM} from "../services/CliTypeORM";

export interface TypeORMContext extends CliDefaultOptions {
  command: string;
}

@Command({
  name: "typeorm",
  description: "Run a typeorm command",
  args: {
    command: {
      description: "The typeorm command",
      type: String,
      required: true
    }
  },
  options: {},
  allowUnknownOption: true
})
export class TypeORMCmd implements CommandProvider {
  @Inject()
  cliTypeORM: CliTypeORM;

  async $exec(ctx: TypeORMContext) {
    return [
      {
        title: `Run TypeORM CLI ${ctx.command}`,
        task: () => this.cliTypeORM.run(ctx.command, ctx.rawArgs)
      }
    ];
  }
}
