import {classOf} from "@tsed/core";
import {
  configuration,
  constant,
  context,
  destroyInjector,
  DIContext,
  getContext,
  inject,
  injectable,
  injector,
  logger,
  Provider,
  runInContext
} from "@tsed/di";
import {$asyncAlter, $asyncEmit} from "@tsed/hooks";
import {pascalCase} from "change-case";
import {Argument, Command} from "commander";
import Inquirer from "inquirer";
import inquirer_autocomplete_prompt from "inquirer-autocomplete-prompt";
import {v4} from "uuid";

import {CommandStoreKeys} from "../domains/CommandStoreKeys.js";
import type {CommandData} from "../interfaces/CommandData.js";
import type {CommandMetadata} from "../interfaces/CommandMetadata.js";
import type {CommandArg, CommandOptions} from "../interfaces/CommandParameters.js";
import type {CommandProvider} from "../interfaces/CommandProvider.js";
import type {Task} from "../interfaces/index.js";
import {PackageManagersModule} from "../packageManagers/index.js";
import {createSubTasks, createTasksRunner} from "../utils/createTasksRunner.js";
import {getCommandMetadata} from "../utils/getCommandMetadata.js";
import {mapCommanderOptions} from "../utils/index.js";
import {mapCommanderArgs} from "../utils/mapCommanderArgs.js";
import {parseOption} from "../utils/parseOption.js";
import {CliHooks} from "./CliHooks.js";
import {ProjectPackageJson} from "./ProjectPackageJson.js";

Inquirer.registerPrompt("autocomplete", inquirer_autocomplete_prompt);

export class CliService {
  readonly reinstallAfterRun = constant<boolean>("project.reinstallAfterRun", false);
  readonly program = new Command();
  protected pkg: Record<string, any> = constant("pkg", {version: "1.0.0"});
  protected hooks = inject(CliHooks);
  protected projectPkg = inject(ProjectPackageJson);
  protected packageManagers = inject(PackageManagersModule);
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
  public runLifecycle(cmdName: string, data: CommandData = {}, $ctx: DIContext) {
    return runInContext($ctx, async () => {
      $ctx.set("dispatchCmd", cmdName);

      await $asyncEmit("$loadPackageJson");

      data = await this.beforePrompt(cmdName, data, $ctx);
      data = await this.prompt(cmdName, data, $ctx);

      try {
        await this.exec(cmdName, data, $ctx);
      } catch (er) {
        await $asyncEmit("$onFinish", [data, er]);
        await destroyInjector();
        throw er;
      }

      await $asyncEmit("$onFinish", [data]);
      await destroyInjector();
    });
  }

  public async exec(cmdName: string, data: any, $ctx: DIContext) {
    const initialTasks = await this.getTasks(cmdName, data);

    $ctx.set("data", data);

    if (initialTasks.length) {
      const tasks = [
        ...initialTasks,
        {
          title: "Install dependencies",
          enabled: () => this.reinstallAfterRun && (this.projectPkg.rewrite || this.projectPkg.reinstall),
          task: createSubTasks(() => this.packageManagers.install(data), {...data, concurrent: false})
        },
        ...(await this.getPostInstallTasks(cmdName, data))
      ];

      data = this.mapData(cmdName, data, $ctx);

      $ctx.set("data", data);

      return createTasksRunner(tasks, data);
    }
  }

  /**
   * Run prompt for a given command
   * @param cmdName
   * @param data Initial data
   * @param $ctx
   */
  public async beforePrompt(cmdName: string, data: CommandData = {}, $ctx: DIContext) {
    const provider = this.commands.get(cmdName);
    const instance = inject<CommandProvider>(provider.useClass)!;
    const verbose = data.verbose;

    $ctx.set("data", data);

    if (instance.$beforePrompt) {
      data = await instance.$beforePrompt(JSON.parse(JSON.stringify(data)));
      data.verbose = verbose;
    }

    $ctx.set("data", data);

    return data;
  }

  /**
   * Run prompt for a given command
   * @param cmdName
   * @param data
   * @param $ctx
   */
  public async prompt(cmdName: string, data: CommandData = {}, $ctx: DIContext) {
    const provider = this.commands.get(cmdName);
    const instance = inject<CommandProvider>(provider.useClass)!;

    $ctx.set("data", data);

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

    $ctx.set("data", data);

    return data;
  }

  /**
   * Run lifecycle
   * @param cmdName
   * @param data
   */
  public async getTasks(cmdName: string, data: any): Promise<Task[]> {
    const $ctx = getContext()!;
    const provider = this.commands.get(cmdName);
    const instance = inject<CommandProvider>(provider.token)!;

    data = this.mapData(cmdName, data, $ctx);

    if (instance.$beforeExec) {
      await instance.$beforeExec(data);
    }

    return [
      ...(await instance.$exec(data)),
      ...(await this.hooks.emit(CommandStoreKeys.EXEC_HOOKS, cmdName, data)),
      ...(await $asyncAlter(`$alter${pascalCase(cmdName)}Tasks`, [], [data]))
    ].map((opts) => {
      return {
        ...opts,
        task: async (arg, task) => {
          context().set("currentTask", task);

          const result = await opts.task(arg, task);

          context().delete("currentTask");

          return result;
        }
      };
    });
  }

  public async getPostInstallTasks(cmdName: string, data: any) {
    const provider = this.commands.get(cmdName);
    const instance = inject<CommandProvider>(provider.useClass)!;

    data = this.mapData(cmdName, data, getContext()!);

    return [
      ...(instance.$postInstall ? await instance.$postInstall(data) : []),
      ...(await this.hooks.emit(CommandStoreKeys.POST_INSTALL_HOOKS, cmdName, data)),
      ...(await $asyncAlter(`$alter${pascalCase(cmdName)}PostInstallTasks`, [] as Task[], [data])),
      ...(instance.$afterPostInstall ? await instance.$afterPostInstall(data) : [])
    ];
  }

  public createCommand(metadata: CommandMetadata) {
    const {args, name, options, description, alias, allowUnknownOption} = metadata;

    if (this.commands.has(name)) {
      return this.commands.get(name).command;
    }

    let cmd = this.program.command(name);

    const onAction = (commandName: string) => {
      const [, ...rawArgs] = cmd.args;
      const mappedArgs = mapCommanderArgs(
        args,
        this.program.args.filter((arg) => commandName === arg)
      );
      const allOpts = mapCommanderOptions(commandName, this.program.commands);

      const data: CommandData = {
        ...allOpts,
        verbose: !!this.program.opts().verbose,
        ...mappedArgs,
        ...cmd.opts(),
        rawArgs
      };

      const $ctx = new DIContext({
        id: v4(),
        injector: injector(),
        logger: logger(),
        level: logger().level,
        maxStackSize: 0,
        platform: "CLI"
      });

      $ctx.set("data", data);
      $ctx.set("command", metadata);

      configuration().set("command.metadata", metadata);

      return this.runLifecycle(name, data, $ctx);
    };

    if (alias) {
      cmd = cmd.alias(alias);
    }

    cmd = cmd.description(description);
    cmd = this.buildArguments(cmd, args);

    cmd = cmd.action(onAction as never);

    if (options) {
      cmd = this.buildOption(cmd, options, !!allowUnknownOption);
    }

    return cmd;
  }

  private load() {
    injector()
      .getProviders("command")
      .forEach((provider) => this.build(provider));
  }

  private mapData(cmdName: string, data: CommandData, $ctx: DIContext) {
    const provider = this.commands.get(cmdName);
    const instance = inject<CommandProvider>(provider.useClass)!;
    const verbose = data.verbose;

    data.commandName ||= cmdName;

    if (instance.$mapContext) {
      data = instance.$mapContext(JSON.parse(JSON.stringify(data)));
      data.verbose = verbose;
    }

    if (data.verbose) {
      logger().level = "debug";
    } else {
      logger().level = "info";
    }

    data.bindLogger = $ctx.get("command")?.bindLogger;

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

injectable(CliService);
