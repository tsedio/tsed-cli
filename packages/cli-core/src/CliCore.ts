import "@tsed/logger-std";

import {join, resolve} from "node:path";

import {constant, inject, injector} from "@tsed/di";
import {$asyncEmit} from "@tsed/hooks";
import chalk from "chalk";
import {Command} from "commander";
import semver from "semver";
import updateNotifier from "update-notifier";

import {CliError} from "./domains/CliError.js";
import {CliService} from "./services/CliService.js";
import {createInjector} from "./utils/createInjector.js";
import {loadPlugins} from "./utils/loadPlugins.js";
import {resolveConfiguration} from "./utils/resolveConfiguration.js";

function isHelpManual(argv: string[]) {
  return argv.includes("-h") || argv.includes("--help");
}

export class CliCore {
  protected constructor(settings: Partial<TsED.Configuration>) {
    createInjector(settings);
  }

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

  static async bootstrap(settings: Partial<TsED.Configuration>) {
    if (settings.checkPrecondition) {
      this.checkPrecondition(settings);
    }

    if (settings.updateNotifier) {
      await this.updateNotifier(settings.pkg);
    }

    settings = resolveConfiguration(settings);

    const argv = settings.argv || process.argv;

    return new CliCore({
      ...settings,
      name: settings.name || "tsed",
      argv,
      project: {
        // rootDir: this.getProjectRoot(argv),
        srcDir: "src",
        scriptsDir: "scripts",
        ...(settings.project || {})
      }
    }).bootstrap();
  }

  static async updateNotifier(pkg: any) {
    updateNotifier({pkg, updateCheckInterval: 0}).notify();

    return this;
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
      const cliService = inject(CliService);
      constant("plugins") && (await loadPlugins());

      await $asyncEmit("$beforeInit");
      await injector().load();
      await $asyncEmit("$afterInit");

      injector().settings.set("loaded", true);

      await $asyncEmit("$onReady");

      await cliService.parseArgs(constant("argv")!);
    } catch (er) {
      throw new CliError({origin: er, cli: this});
    }

    return this;
  }
}
