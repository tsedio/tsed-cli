import {classOf} from "@tsed/core";
import {Constant, DIContext, getContext, Inject, Injectable, InjectorService, Provider, runInContext} from "@tsed/di";
import {Argument, Command} from "commander";
import Inquirer from "inquirer";
import {v4} from "uuid";
import {CommandStoreKeys} from "../domains/CommandStoreKeys";
import {CommandProvider} from "../interfaces/CommandProvider";
import {CommandArg, CommandOptions} from "../interfaces/CommandParameters";
import {PROVIDER_TYPE_COMMAND} from "../registries/CommandRegistry";
import {createSubTasks, createTasksRunner} from "../utils/createTasksRunner";
import {getCommandMetadata} from "../utils/getCommandMetadata";
import {mapCommanderArgs} from "../utils/mapCommanderArgs";
import {parseOption} from "../utils/parseOption";
import {CliHooks} from "./CliHooks";
import {ProjectPackageJson} from "./ProjectPackageJson";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import inquirer_autocomplete_prompt from "inquirer-autocomplete-prompt";
import {mapCommanderOptions} from "../utils/mapCommanderOptions";
import {CommandMetadata} from "../interfaces/CommandMetadata";

Inquirer.registerPrompt("autocomplete", inquirer_autocomplete_prompt);

@Injectable()
export class CliService {
  readonly program = new Command();

  @Constant("project.reinstallAfterRun", false)
  reinstallAfterRun = false;

  @Constant("pkg", {version: "1.0.0"})
  protected pkg: any;

  @Inject()
  protected injector: InjectorService;

  @Inject()
  protected hooks: CliHooks;

  @Inject()
  protected projectPkg: ProjectPackageJson;

  private commands = new Map();

  /**
   * Parse process.argv and runLifecycle action
   * @param argv
   */
  async parseArgs(argv: string[]): Promise<void> {
    const {program} = this;

    program.version(this.pkg.version);

    this.load();

    await program.parseAsync(argv);
  }

  /**
   * Run lifecycle
   * @param cmdName
   * @param data
   * @param $ctx
   */
  public runLifecycle(cmdName: string, data: any = {}, $ctx: DIContext) {
    return runInContext($ctx, async () => {
      data = await this.beforePrompt(cmdName, data);

      $ctx.set("data", data);

      data = await this.prompt(cmdName, data);
      await this.dispatch(cmdName, data, $ctx);
    });
  }

  public async dispatch(cmdName: string, data: any, $ctx: DIContext) {
    try {
      $ctx.set("dispatchCmd", cmdName);
      $ctx.set("data", data);

      await this.exec(cmdName, data, $ctx);
    } catch (er) {
      await this.injector.emit("$onFinish", er);
      await this.injector.destroy();
      throw er;
    }

    await this.injector.emit("$onFinish");
    await this.injector.destroy();
  }

  public async exec(cmdName: string, data: any, $ctx: DIContext) {
    const initialTasks = await this.getTasks(cmdName, data);

    if (initialTasks.length) {
      const tasks = [
        ...initialTasks,
        {
          title: "Install dependencies",
          enabled: () => this.reinstallAfterRun && (this.projectPkg.rewrite || this.projectPkg.reinstall),
          task: createSubTasks(() => this.projectPkg.install(data), {...data, concurrent: false})
        },
        ...(await this.getPostInstallTasks(cmdName, data))
      ];

      return createTasksRunner(tasks, this.mapData(cmdName, data, $ctx));
    }
  }

  /**
   * Run prompt for a given command
   * @param cmdName
   * @param ctx Initial data
   */
  public async beforePrompt(cmdName: string, ctx: any = {}) {
    const provider = this.commands.get(cmdName);
    const instance = this.injector.get<CommandProvider>(provider.useClass)!;
    const verbose = ctx.verbose;

    if (instance.$beforePrompt) {
      ctx = await instance.$beforePrompt(JSON.parse(JSON.stringify(ctx)));
      ctx.verbose = verbose;
    }
    return ctx;
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
   * @param data
   */
  public async getTasks(cmdName: string, data: any) {
    const $ctx = getContext()!;
    const provider = this.commands.get(cmdName);
    const instance = this.injector.get<CommandProvider>(provider.token)!;

    data = this.mapData(cmdName, data, $ctx);

    if (instance.$beforeExec) {
      await instance.$beforeExec(data);
    }

    return [...(await instance.$exec(data)), ...(await this.hooks.emit(CommandStoreKeys.EXEC_HOOKS, cmdName, data))];
  }

  public async getPostInstallTasks(cmdName: string, data: any) {
    const provider = this.commands.get(cmdName);
    const instance = this.injector.get<CommandProvider>(provider.useClass)!;

    data = this.mapData(cmdName, data, getContext()!);

    return [
      ...(instance.$postInstall ? await instance.$postInstall(data) : []),
      ...(await this.hooks.emit(CommandStoreKeys.POST_INSTALL_HOOKS, cmdName, data)),
      ...(instance.$afterPostInstall ? await instance.$afterPostInstall(data) : [])
    ];
  }

  public createCommand(metadata: CommandMetadata) {
    const {args, name, options, description, alias, allowUnknownOption} = metadata;

    if (this.commands.has(name)) {
      return this.commands.get(name).command;
    }

    let cmd = this.program.command(name);

    const onAction = (...commanderArgs: any[]) => {
      const [, ...rawArgs] = cmd.args;
      const mappedArgs = mapCommanderArgs(args, commanderArgs);
      const allOpts = mapCommanderOptions(this.program.commands);

      const data = {
        ...allOpts,
        verbose: !!this.program.opts().verbose,
        ...mappedArgs,
        ...cmd.opts(),
        rawArgs
      };

      const $ctx = new DIContext({
        id: v4(),
        injector: this.injector,
        logger: this.injector.logger,
        level: this.injector.logger.level,
        maxStackSize: 0
      });

      $ctx.set("data", data);
      $ctx.set("command", metadata);

      return this.runLifecycle(name, data, $ctx);
    };

    if (alias) {
      cmd = cmd.alias(alias);
    }

    cmd = cmd.description(description);
    cmd = this.buildArguments(cmd, args);

    cmd = cmd.action(onAction);

    if (options) {
      cmd = this.buildOption(cmd, options, !!allowUnknownOption);
    }

    return cmd;
  }

  private load() {
    this.injector.getProviders(PROVIDER_TYPE_COMMAND).forEach((provider) => this.build(provider));
  }

  private mapData(cmdName: string, data: any, $ctx: DIContext) {
    const provider = this.commands.get(cmdName);
    const instance = this.injector.get<CommandProvider>(provider.useClass)!;
    const verbose = data.verbose;

    if (instance.$mapContext) {
      data = instance.$mapContext(JSON.parse(JSON.stringify(data)));
      data.verbose = verbose;
    }

    if (data.verbose) {
      this.injector.logger.level = "debug";
    } else {
      this.injector.logger.level = "info";
    }

    $ctx.set("data", data);

    return data;
  }

  /**
   * Build command and sub-commands
   * @param provider
   */
  private build(provider: Provider<any>) {
    const metadata = getCommandMetadata(provider.useClass);

    if (metadata.name) {
      if (this.commands.has(metadata.name)) {
        throw Error(
          `The ${metadata.name} command is already registered. Change your command name used by the class ${classOf(provider.useClass)}`
        );
      }

      provider.command = this.createCommand(metadata);

      this.commands.set(metadata.name, provider);
    }
  }

  /**
   * Build sub-command options
   * @param subCommand
   * @param options
   * @param allowUnknownOptions
   */
  private buildOption(subCommand: Command, options: {[key: string]: CommandOptions}, allowUnknownOptions: boolean) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Object.entries(options).reduce((subCommand, [flags, {description, required, customParser, defaultValue, ...options}]) => {
      const fn = (v: any) => {
        return parseOption(v, options);
      };

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

    return subCommand;
  }

  private buildArguments(cmd: Command, args: Record<string, CommandArg>) {
    return Object.entries(args).reduce((cmd, [key, {description, required, defaultValue}]) => {
      const argument = new Argument(required ? `<${key}>` : `[${key}]`, description);

      if (defaultValue !== undefined) {
        argument.default(defaultValue);
      }

      return cmd.addArgument(argument);
    }, cmd);
  }
}
