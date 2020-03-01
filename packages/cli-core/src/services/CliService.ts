import {Store} from "@tsed/core";
import {Injectable, InjectorService, Provider} from "@tsed/di";
import {Command} from "commander";
import * as Inquirer from "inquirer";
import {ICommand} from "../interfaces/ICommand";
import {ICommandOptions, ICommandParameters} from "../interfaces/ICommandParameters";
import {PROVIDER_TYPE_COMMAND} from "../registries/CommandRegistry";
import {createCommandSummary} from "../utils/createCommandSummary";
import {mapArgs} from "../utils/mapArgs";
import {mapArgsDescription} from "../utils/mapArgsDescription";
import {parseOption} from "../utils/parseOption";
import "../utils/patchCommander";

import {CliPackageJson} from "./CliPackageJson";

@Injectable()
export class CliService {
  readonly program = new Command();

  constructor(@CliPackageJson() private pkg: CliPackageJson, private injector: InjectorService) {}

  /**
   * Parse process.argv and run action
   * @param argv
   */
  parseArgs(argv: string[]) {
    const {program} = this;
    program.version(this.pkg.version);

    this.injector.getProviders(PROVIDER_TYPE_COMMAND).forEach(provider => this.build(provider));

    if (argv.includes("-r") || argv.includes("--project-root")) {
    }

    program.parse(argv);
  }

  /**
   * Build command and sub-commands
   * @param provider
   */
  private build(provider: Provider<any>) {
    const {name, args = {}, description, options = {}} = Store.from(provider.useClass)?.get("command") as ICommandParameters;

    if (name) {
      const subCommand = this.program
        .command(createCommandSummary(name, args))
        .description(description, mapArgsDescription(args))
        .action((...commanderArgs: any[]) => this.runAction(provider, mapArgs(args, commanderArgs)));

      if (options) {
        this.buildOption(subCommand as any, options);
      }
    }
  }

  /**
   * Build sub-command options
   * @param subCommand
   * @param options
   */
  private buildOption(subCommand: Command, options: {[key: string]: ICommandOptions}) {
    Object.entries(options).reduce((subCommand, [flags, {description, required, customParser, defaultValue, ...options}]) => {
      const fn = (v: any) => parseOption(v, options);

      if (options.type === Boolean) {
        defaultValue = false;
      }

      return required
        ? subCommand.requiredOption(flags, description, fn, defaultValue)
        : subCommand.option(flags, description, fn, defaultValue);
    }, subCommand);

    subCommand.option("-r, --project-root <path>", "Project root directory");
  }

  /**
   * Run action lifecycle
   * @param provider
   * @param data
   */
  private async runAction(provider: Provider<any>, data: any) {
    const instance = this.injector.get<ICommand>(provider.useClass)!;

    if (instance.$prompt) {
      const questions = await instance.$prompt(data);

      await this.injector.emit("$onPrompt", questions);

      if (questions) {
        data = {
          ...data,
          ...(await Inquirer.prompt(questions))
        };
      }
    }

    await instance.$exec(data);
  }
}
