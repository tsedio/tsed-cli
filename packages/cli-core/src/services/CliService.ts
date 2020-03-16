import {classOf} from "@tsed/core";
import {Injectable, InjectorService, Provider} from "@tsed/di";
import {Command} from "commander";
import * as Inquirer from "inquirer";
import * as Listr from "listr";
import {CommandStoreKeys} from "../domains/CommandStoreKeys";
import {ICommand} from "../interfaces/ICommand";
import {ICommandMetadata} from "../interfaces/ICommandMetadata";
import {ICommandOptions} from "../interfaces/ICommandParameters";
import {PROVIDER_TYPE_COMMAND} from "../registries/CommandRegistry";
import {createCommandSummary} from "../utils/createCommandSummary";
import {getCommandMetadata} from "../utils/getCommandMetadata";
import {mapArgs} from "../utils/mapArgs";
import {mapArgsDescription} from "../utils/mapArgsDescription";
import {parseOption} from "../utils/parseOption";
import "../utils/patchCommander";

import {CliPackageJson} from "./CliPackageJson";
import {ProjectPackageJson} from "./ProjectPackageJson";

Inquirer.registerPrompt("autocomplete", require("inquirer-autocomplete-prompt"));

@Injectable()
export class CliService {
  readonly program = new Command();

  private commands = new Map();

  constructor(private injector: InjectorService, @CliPackageJson() private pkg: CliPackageJson, private projectPkg: ProjectPackageJson) {}

  /**
   * Parse process.argv and run action
   * @param argv
   */
  parseArgs(argv: string[]) {
    const {program} = this;
    program.version(this.pkg.version);

    this.injector.getProviders(PROVIDER_TYPE_COMMAND).forEach(provider => this.build(provider));

    program.parse(argv);
  }

  public async callHook(hookName: string, cmd: string, ...args: any[]) {
    const providers = this.injector.getProviders();
    let results: any = [];

    for (const provider of providers) {
      if (provider.useClass) {
        const instance: any = this.injector.get(provider.token)!;

        if (provider.store.has(hookName)) {
          const props = provider.store.get(hookName)[cmd];
          if (props) {
            for (const propertyKey of props) {
              results = results.concat(await instance[propertyKey](...args));
            }
          }
        }
      }
    }

    return results.filter((o: any) => o !== undefined);
  }

  /**
   * Run lifecycle
   * @param cmdName
   * @param data
   */
  public async run(cmdName: string, data: any) {
    this.program.commands.forEach(command => {
      Object.entries(command)
        .filter(([key]) => !key.startsWith("_") && !["commands", "options", "parent", "rawArgs", "args"].includes(key))
        .forEach(([key, value]) => {
          data[key] = value;
        });
    });

    const provider = this.commands.get(cmdName);
    const instance = this.injector.get<ICommand>(provider.useClass)!;

    if (instance.$prompt) {
      const questions = [
        ...((await instance.$prompt(data)) as any[]),
        ...(await this.callHook(CommandStoreKeys.PROMPT_HOOKS, cmdName, data))
      ];

      if (questions.length) {
        data = {
          ...data,
          ...((await Inquirer.prompt(questions)) as any)
        };
      }
    }

    const tasks = [
      ...(await instance.$exec(data)),
      ...(await this.callHook(CommandStoreKeys.EXEC_HOOKS, cmdName, data)),
      {
        title: "Install dependencies",
        skip: () => !this.projectPkg.rewrite && !this.projectPkg.reinstall,
        task: () => {
          return this.projectPkg.install({packageManager: "yarn"});
        }
      }
    ];

    await new Listr(tasks).run(data);
  }

  /**
   * Build sub-command options
   * @param subCommand
   * @param options
   */
  public buildOption(subCommand: Command, options: {[key: string]: ICommandOptions}) {
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

  public createCommand(metadata: ICommandMetadata) {
    const {args, name, description} = metadata;

    if (this.commands.has(name)) {
      return this.commands.get(name).command;
    }

    return this.program
      .command(createCommandSummary(name, args))
      .description(description, mapArgsDescription(args))
      .action((...commanderArgs: any[]) => this.run(name, mapArgs(args, commanderArgs)));
  }

  /**
   * Build command and sub-commands
   * @param provider
   */
  private build(provider: Provider<any>) {
    const {name, options} = getCommandMetadata(provider.useClass);

    if (name) {
      if (this.commands.has(name)) {
        throw Error(`The ${name} command is already registered. Change your command name used by the class ${classOf(provider.useClass)}`);
      }

      provider.command = this.createCommand(getCommandMetadata(provider.useClass));
      this.commands.set(name, provider);

      if (options) {
        this.buildOption(provider.command as any, options);
      }
    }
  }
}
