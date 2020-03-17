import {classOf} from "@tsed/core";
import {Inject, Injectable, InjectorService, Provider} from "@tsed/di";
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
import {mapArgsDescription} from "../utils/mapArgsDescription";
import {mapCommanderArgs} from "../utils/mapCommanderArgs";
import {mapCommanderOptions} from "../utils/mapCommanderOptions";
import {parseOption} from "../utils/parseOption";
import {CliHooks} from "./CliHooks";

import {CliPackageJson} from "./CliPackageJson";
import {ProjectPackageJson} from "./ProjectPackageJson";

Inquirer.registerPrompt("autocomplete", require("inquirer-autocomplete-prompt"));

@Injectable()
export class CliService {
  readonly program = new Command();

  @Inject()
  protected injector: InjectorService;

  @Inject()
  protected hooks: CliHooks;

  @Inject()
  protected projectPkg: ProjectPackageJson;

  @CliPackageJson()
  protected pkg: CliPackageJson;

  private commands = new Map();

  /**
   * Parse process.argv and runLifecycle action
   * @param argv
   */
  parseArgs(argv: string[]) {
    const {program} = this;
    program.version(this.pkg.version);

    this.injector.getProviders(PROVIDER_TYPE_COMMAND).forEach(provider => this.build(provider));

    program.parse(argv);
  }

  /**
   * Run lifecycle
   * @param cmdName
   * @param data
   */
  public async runLifecycle(cmdName: string, data: any = {}) {
    data = await this.prompt(cmdName, data);

    return this.exec(cmdName, data);
  }

  public async exec(cmdName: string, data: any) {
    const tasks = await this.getTasks(cmdName, data);

    return new Listr(
      [
        ...tasks,
        {
          title: "Install dependencies",
          skip: () => !this.projectPkg.rewrite && !this.projectPkg.reinstall,
          task: () => {
            return this.projectPkg.install({packageManager: "yarn"});
          }
        }
      ],
      {concurrent: false}
    ).run(data);
  }

  /**
   * Run prompt for a given command
   * @param cmdName
   * @param data Initial data
   */
  public async prompt(cmdName: string, data: any = {}) {
    const provider = this.commands.get(cmdName);
    const instance = this.injector.get<ICommand>(provider.useClass)!;

    if (instance.$prompt) {
      const questions = [
        ...((await instance.$prompt(data)) as any[]),
        ...(await this.hooks.emit(CommandStoreKeys.PROMPT_HOOKS, cmdName, data))
      ];

      if (questions.length) {
        data = {
          ...data,
          ...((await Inquirer.prompt(questions)) as any)
        };
      }
    }

    return data;
  }

  /**
   * Run lifecycle
   * @param cmdName
   * @param data
   */
  public async getTasks(cmdName: string, data: any) {
    const provider = this.commands.get(cmdName);
    const instance = this.injector.get<ICommand>(provider.useClass)!;

    return [...(await instance.$exec(data)), ...(await this.hooks.emit(CommandStoreKeys.EXEC_HOOKS, cmdName, data))];
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
      .action((...commanderArgs: any[]) => {
        const data = {
          ...mapCommanderArgs(args, commanderArgs),
          ...mapCommanderOptions(this.program.commands)
        };

        this.runLifecycle(name, data);
      });
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
