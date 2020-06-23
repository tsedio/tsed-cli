import {Module} from "@tsed/di";
import * as chalk from "chalk";
import {Command} from "commander";
import {join, resolve} from "path";
import * as UpdateNotifier from "update-notifier";
import {CliConfiguration} from "./services/CliConfiguration";
import {CliPackageJson} from "./services/CliPackageJson";
import {CliService} from "./services/CliService";
import {ProjectPackageJson} from "./services/ProjectPackageJson";
import {Renderer} from "./services/Renderer";
import {createInjector} from "./utils/createInjector";
import {loadInjector} from "./utils/loadInjector";
import {loadPlugins} from "./utils/loadPlugins";

const semver = require("semver");

function checkSettings(settings: any) {
  if (!settings.pkg) {
    console.log(chalk.red(`settings.pkg is required. Require the package.json of your CLI when you bootstrap the CLI.`));
    process.exit(1);
  }

  if (!settings.name) {
    console.log(chalk.red(`settings.name is required. Add the name of your CLI.`));
    process.exit(1);
  }
}

function checkNodeVersion(wanted: string, id: string) {
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
}

@Module({
  imports: [CliPackageJson, ProjectPackageJson, CliService, CliConfiguration, Renderer]
})
export class Cli {
  constructor(@CliPackageJson() readonly pkg: CliPackageJson, private cliService: CliService) {
    UpdateNotifier({pkg, updateCheckInterval: 0}).notify();
  }

  static async bootstrap(settings: Partial<TsED.Configuration>): Promise<Cli> {
    checkSettings(settings);

    if (settings.pkg.engines?.node) {
      checkNodeVersion(settings.pkg.engines.node, settings.pkg.name);
    }

    require("module-alias").addAliases({
      "@tsed/core": require.resolve("@tsed/core"),
      "@tsed/di": require.resolve("@tsed/di"),
      "@tsed/cli-core": require.resolve("@tsed/cli-core"),
      [settings.pkg.name]: require.resolve(settings.pkg.name)
    });

    const injector = createInjector({
      ...settings,
      project: {
        rootDir: this.getProjectRoot(),
        srcDir: "src",
        scriptsDir: "scripts",
        ...(settings.project || {})
      }
    });
    await loadPlugins(injector);

    await loadInjector(injector, Cli);

    await injector.emit("$onReady");

    return injector.get<Cli>(Cli)!;
  }

  static getProjectRoot(argv = process.argv) {
    if (!(argv.includes("-h") || argv.includes("--help"))) {
      const projectRoot =
        new Command()
          .option("-r, --root-dir <path>", "Project root directory")
          .option("--verbose", "Verbose mode", () => true)
          .allowUnknownOption(true)
          .parse(argv).rootDir || "";

      return resolve(join(process.cwd(), projectRoot));
    }

    return process.cwd();
  }

  parseArgs(args = process.argv) {
    this.cliService.parseArgs(args);
  }
}
