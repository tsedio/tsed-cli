import {Inject, InjectorService, Module} from "@tsed/di";
import {Type} from "@tsed/core";
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

function isHelpManual(argv: string[]) {
  return argv.includes("-h") || argv.includes("--help");
}

@Module({
  imports: [CliPackageJson, ProjectPackageJson, CliService, CliConfiguration, Renderer]
})
export class CliCore {
  @Inject()
  injector: InjectorService;

  @Inject()
  cliService: CliService;

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

  static async bootstrap(settings: Partial<TsED.Configuration>, module: Type = CliCore): Promise<CliCore> {
    const injector = this.createInjector(settings);

    await loadPlugins(injector);
    await loadInjector(injector, module);

    await injector.emit("$onReady");

    const cli = injector.get<CliCore>(CliCore)!;

    await cli.cliService.parseArgs(injector.settings.argv!);

    return cli;
  }

  static updateNotifier(pkg: any) {
    UpdateNotifier({pkg, updateCheckInterval: 0}).notify();
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
}
