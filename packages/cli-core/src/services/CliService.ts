import {classOf, isArray} from "@tsed/core";
import {Inject, Injectable, InjectorService, Provider} from "@tsed/di";
import {Command} from "commander";
import * as Inquirer from "inquirer";
import {CommandStoreKeys} from "../domains/CommandStoreKeys";
import {CommandProvider} from "../interfaces/CommandProvider";
import {CommandMetadata} from "../interfaces/CommandMetadata";
import {CommandOptions} from "../interfaces/CommandParameters";
import {PROVIDER_TYPE_COMMAND} from "../registries/CommandRegistry";
import {createCommandSummary} from "../utils/createCommandSummary";
import {createTasksRunner} from "../utils/createTasksRunner";
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

    this.load();

    program.parse(argv);
  }

  private load() {
    this.injector.getProviders(PROVIDER_TYPE_COMMAND).forEach((provider) => this.build(provider));
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

  public async exec(cmdName: string, ctx: any) {
    const tasks = [
      ...(await this.getTasks(cmdName, ctx)),
      {
        title: "Install dependencies",
        when: () => this.projectPkg.rewrite || this.projectPkg.reinstall,
        task: () => {
          return this.projectPkg.install(ctx);
        }
      },
      ...(await this.getPostInstallTasks(cmdName, ctx))
    ];

    return createTasksRunner(tasks, this.mapContext(cmdName, ctx));
  }

  /**
   * Run prompt for a given command
   * @param cmdName
   * @param ctx Initial data
   */
  public async prompt(cmdName: string, ctx: any = {}) {
    const provider = this.commands.get(cmdName);
    const instance = this.injector.get<CommandProvider>(provider.useClass)!;

    if (instance.$prompt) {
      const questions = [
        ...((await instance.$prompt(ctx)) as any[]),
        ...(await this.hooks.emit(CommandStoreKeys.PROMPT_HOOKS, cmdName, ctx))
      ];

      if (questions.length) {
        ctx = {
          ...ctx,
          ...((await Inquirer.prompt(questions)) as any)
        };
      }
    }

    return ctx;
  }

  /**
   * Run lifecycle
   * @param cmdName
   * @param ctx
   */
  public async getTasks(cmdName: string, ctx: any) {
    const provider = this.commands.get(cmdName);
    const instance = this.injector.get<CommandProvider>(provider.token)!;

    ctx = this.mapContext(cmdName, ctx);

    if (instance.$beforeExec) {
      await instance.$beforeExec(ctx);
    }

    return [...(await instance.$exec(ctx)), ...(await this.hooks.emit(CommandStoreKeys.EXEC_HOOKS, cmdName, ctx))];
  }

  public async getPostInstallTasks(cmdName: string, ctx: any) {
    const provider = this.commands.get(cmdName);
    const instance = this.injector.get<CommandProvider>(provider.useClass)!;

    ctx = this.mapContext(cmdName, ctx);

    return [
      ...(instance.$postInstall ? await instance.$postInstall(ctx) : []),
      ...(await this.hooks.emit(CommandStoreKeys.POST_INSTALL_HOOKS, cmdName, ctx))
    ];
  }

  /**
   * Build sub-command options
   * @param subCommand
   * @param options
   * @param allowUnknownOptions
   */
  public buildOption(subCommand: Command, options: {[key: string]: CommandOptions}, allowUnknownOptions: boolean) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Object.entries(options).reduce((subCommand, [flags, {description, required, customParser, defaultValue, ...options}]) => {
      const fn = (v: any) => parseOption(v, options);

      if (options.type === Boolean) {
        defaultValue = false;
      }

      return required
        ? subCommand.requiredOption(flags, description, fn, defaultValue)
        : subCommand.option(flags, description, fn, defaultValue);
    }, subCommand);

    subCommand.option("-r, --root-dir <path>", "Project root directory");
    subCommand.option("--verbose", "Verbose mode", () => true);

    if (allowUnknownOptions) {
      subCommand.allowUnknownOption(true);
    }
  }

  public createCommand(metadata: CommandMetadata) {
    const {args, name, description, alias} = metadata;

    if (this.commands.has(name)) {
      return this.commands.get(name).command;
    }

    let cmd = this.program.command(createCommandSummary(name, args));

    if (alias) {
      cmd = cmd.alias(alias);
    }

    return cmd.description(description, mapArgsDescription(args)).action((...commanderArgs: any[]) => {
      const data = {
        ...mapCommanderArgs(args, commanderArgs),
        ...mapCommanderOptions(this.program.commands),
        rawArgs: commanderArgs.filter(isArray).reduce((arg, current) => arg.concat(current), [])
      };

      this.runLifecycle(name, data);
    });
  }

  private mapContext(cmdName: string, ctx: any) {
    const provider = this.commands.get(cmdName);
    const instance = this.injector.get<CommandProvider>(provider.useClass)!;

    if (instance.$mapContext) {
      ctx = instance.$mapContext(JSON.parse(JSON.stringify(ctx)));
    }

    return ctx;
  }

  /**
   * Build command and sub-commands
   * @param provider
   */
  private build(provider: Provider<any>) {
    const {name, options, allowUnknownOption} = getCommandMetadata(provider.useClass);

    if (name) {
      if (this.commands.has(name)) {
        throw Error(`The ${name} command is already registered. Change your command name used by the class ${classOf(provider.useClass)}`);
      }

      provider.command = this.createCommand(getCommandMetadata(provider.token));
      this.commands.set(name, provider);

      if (options) {
        this.buildOption(provider.command as any, options, allowUnknownOption);
      }
    }
  }
}
