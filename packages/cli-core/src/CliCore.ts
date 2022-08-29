import {createContainer, Inject, InjectorService, Module} from "@tsed/di";
import {Type} from "@tsed/core";
import chalk from "chalk";
import {Command} from "commander";
import {join, resolve} from "path";
import updateNotifier from "update-notifier";
import {CliConfiguration} from "./services/CliConfiguration";
import {CliPackageJson} from "./services/CliPackageJson";
import {CliService} from "./services/CliService";
import {ProjectPackageJson} from "./services/ProjectPackageJson";
import {createInjector} from "./utils/createInjector";
import {loadPlugins} from "./utils/loadPlugins";
import {CliError} from "./domains/CliError";
import semver from "semver";

function isHelpManual(argv: string[]) {
  return argv.includes("-h") || argv.includes("--help");
}

@Module({
  imports: [CliPackageJson, ProjectPackageJson, CliService, CliConfiguration]
})
export class CliCore {
  @Inject()
  readonly injector: InjectorService;

  @Inject()
  readonly cliService: CliService;

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
    const injector = this.createInjector(settings);

    settings.plugins && (await loadPlugins(injector));

    await this.loadInjector(injector, module);

    await injector.emit("$onReady");

    return injector.get<Cli>(CliCore)!;
  }

  static async bootstrap(settings: Partial<TsED.Configuration>, module: Type = CliCore) {
    const cli = await this.create(settings, module);

    return cli.bootstrap();
  }

  static async loadInjector(injector: InjectorService, module: Type = CliCore) {
    await injector.emit("$beforeInit");

    const container = createContainer();

    await injector.load(container, module);

    await injector.emit("$afterInit");

    injector.settings.set("loaded", true);
  }

  static updateNotifier(pkg: any) {
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
