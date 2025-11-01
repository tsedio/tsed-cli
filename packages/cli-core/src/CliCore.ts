import "@tsed/logger-std";

import {join, resolve} from "node:path";

import {Type} from "@tsed/core";
import {inject, injectable, InjectorService} from "@tsed/di";
import {$asyncEmit} from "@tsed/hooks";
import chalk from "chalk";
import {Command} from "commander";
import semver from "semver";
import updateNotifier from "update-notifier";

import {CliError} from "./domains/CliError.js";
import {CliPackageJson} from "./services/CliPackageJson.js";
import {CliService} from "./services/CliService.js";
import {ProjectPackageJson} from "./services/ProjectPackageJson.js";
import {createInjector} from "./utils/createInjector.js";
import {loadPlugins} from "./utils/loadPlugins.js";
import {resolveConfiguration} from "./utils/resolveConfiguration.js";

function isHelpManual(argv: string[]) {
  return argv.includes("-h") || argv.includes("--help");
}

export class CliCore {
  readonly injector = inject(InjectorService);
  readonly cliService = inject(CliService);

  static checkPrecondition(settings: any) {
    const {pkg} = settings;

    this.checkPackage(pkg);

    if (pkg?.engines?.node) {
      this.checkNodeVersion(pkg.engines.node, pkg.name);
    }
  }

  static checkPackage(pkg: any) {
    if (!pkg) {
      console.log(chalk.red(`settings.pkg is required. Require the package.json of your CLI when you bootstrap the CLI.`));
      process.exit(1);
    }
  }

  static checkNodeVersion(wanted: string, id: string) {
    if (!semver.satisfies(process.version, wanted)) {
      console.log(
        chalk.red(
          "You are using Node " +
            process.version +
            ", but this version of " +
            id +
            " requires Node " +
            wanted +
            ".\nPlease upgrade your Node version."
        )
      );
      process.exit(1);
    }

    return this;
  }

  static async create<Cli extends CliCore = CliCore>(settings: Partial<TsED.Configuration>, module: Type = CliCore): Promise<Cli> {
    settings = resolveConfiguration(settings);

    const injector = this.createInjector(settings);

    settings.plugins && (await loadPlugins());

    await this.loadInjector(injector, module);

    await $asyncEmit("$onReady");

    return inject<Cli>(CliCore as any)!;
  }

  static async bootstrap(settings: Partial<TsED.Configuration>, module: Type = CliCore) {
    if (settings.checkPrecondition) {
      this.checkPrecondition(settings);
    }
    if (settings.updateNotifier) {
      await this.updateNotifier(settings.pkg);
    }

    const cli = await this.create(settings, module);

    return cli.bootstrap();
  }

  static async loadInjector(injector: InjectorService, module: Type = CliCore) {
    await $asyncEmit("$beforeInit");

    injector.addProvider(CliCore, {
      useClass: module
    });

    await injector.load();
    await injector.invoke(module);
    await $asyncEmit("$afterInit");

    injector.settings.set("loaded", true);
  }

  static async updateNotifier(pkg: any) {
    updateNotifier({pkg, updateCheckInterval: 0}).notify();

    return this;
  }

  protected static createInjector(settings: Partial<TsED.Configuration>) {
    const argv = settings.argv || process.argv;

    return createInjector({
      ...settings,
      name: settings.name || "tsed",
      argv,
      project: {
        rootDir: this.getProjectRoot(argv),
        srcDir: "src",
        scriptsDir: "scripts",
        ...(settings.project || {})
      }
    });
  }

  protected static getProjectRoot(argv: string[]) {
    if (!isHelpManual(argv)) {
      const projectRoot =
        new Command().option("-r, --root-dir <path>", "Project root directory").allowUnknownOption(true).parse(argv).opts().rootDir || "";

      return resolve(join(process.cwd(), projectRoot));
    }

    return process.cwd();
  }

  async bootstrap() {
    try {
      await this.cliService.parseArgs(this.injector.settings.get("argv")!);
    } catch (er) {
      throw new CliError({origin: er, cli: this});
    }

    return this;
  }
}

injectable(CliCore).imports([CliPackageJson, ProjectPackageJson, CliService]);
