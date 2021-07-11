import {classOf, isArray} from "@tsed/core";
import {Constant, Inject, Injectable, InjectorService, Provider} from "@tsed/di";
import {Argument, Command} from "commander";
import Inquirer from "inquirer";
import {CommandStoreKeys} from "../domains/CommandStoreKeys";
import {CommandProvider} from "../interfaces/CommandProvider";
import {CommandMetadata} from "../interfaces/CommandMetadata";
import {CommandArg, CommandOptions} from "../interfaces/CommandParameters";
import {PROVIDER_TYPE_COMMAND} from "../registries/CommandRegistry";
import {createTasksRunner} from "../utils/createTasksRunner";
import {getCommandMetadata} from "../utils/getCommandMetadata";
import {mapCommanderArgs} from "../utils/mapCommanderArgs";
import {mapCommanderOptions} from "../utils/mapCommanderOptions";
import {parseOption} from "../utils/parseOption";
import {CliHooks} from "./CliHooks";
import {ProjectPackageJson} from "./ProjectPackageJson";

Inquirer.registerPrompt("autocomplete", require("inquirer-autocomplete-prompt"));

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

  $onInit() {
    if (this.injector.logger.level !== "off") {
      this.injector.logger.appenders
        .set("stdout", {
          type: "stdout",
          layout: {
            type: "pattern",
            pattern: "[%d{hh:mm:ss}] %m%n"
          },
          level: ["info", "debug"]
        })
        .set("stderr", {
          type: "stderr",
          layout: {
            type: "pattern",
            pattern: "[%d{hh:mm:ss}][%p] %m%n"
          },
          level: ["trace", "fatal", "error", "warn"]
        });
    }
  }

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
   */
  public async runLifecycle(cmdName: string, data: any = {}) {
    data = await this.prompt(cmdName, data);

    await this.exec(cmdName, data);

    await this.injector.destroy();
  }

  public async exec(cmdName: string, ctx: any) {
    const initialTasks = await this.getTasks(cmdName, ctx);

    if (initialTasks.length) {
      const tasks = [
        ...initialTasks,
        {
          title: "Install dependencies",
          enabled: () => this.reinstallAfterRun && (this.projectPkg.rewrite || this.projectPkg.reinstall),
          task: () => {
            return this.projectPkg.install(ctx);
          }
        },
        ...(await this.getPostInstallTasks(cmdName, ctx))
      ];

      return createTasksRunner(tasks, this.mapContext(cmdName, ctx));
    }
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

  public createCommand(metadata: CommandMetadata) {
    const {args, name, options, description, alias, allowUnknownOption} = metadata;

    if (this.commands.has(name)) {
      return this.commands.get(name).command;
    }

    const onAction = (...commanderArgs: any[]) => {
      const data = {
        verbose: !!this.program.opts().verbose,
        ...mapCommanderArgs(args, commanderArgs),
        ...mapCommanderOptions(this.program.commands),
        rawArgs: commanderArgs.filter(isArray).reduce((arg, current) => arg.concat(current), [])
      };

      return this.runLifecycle(name, data);
    };

    let cmd = this.program.command(name);

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

  private mapContext(cmdName: string, ctx: any) {
    const provider = this.commands.get(cmdName);
    const instance = this.injector.get<CommandProvider>(provider.useClass)!;
    const verbose = ctx.verbose;

    if (instance.$mapContext) {
      ctx = instance.$mapContext(JSON.parse(JSON.stringify(ctx)));
      ctx.verbose = verbose;
    }

    if (ctx.verbose) {
      this.injector.logger.level = "debug";
    } else {
      this.injector.logger.level = "info";
    }

    return ctx;
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
