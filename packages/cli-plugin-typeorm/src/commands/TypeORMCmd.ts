import {Command, ICliDefaultOptions, ICommand, Inject} from "@tsed/cli-core";
import {CliTypeORM} from "../services/CliTypeORM";

export interface ITypeORMContext extends ICliDefaultOptions {
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
export class TypeORMCmd implements ICommand {
  @Inject()
  cliTypeORM: CliTypeORM;

  async $exec(ctx: ITypeORMContext) {
    return [
      {
        title: `Run TypeORM CLI ${ctx.command}`,
        task: () => this.cliTypeORM.run(ctx.command, ctx.rawArgs)
      }
    ];
  }
}
