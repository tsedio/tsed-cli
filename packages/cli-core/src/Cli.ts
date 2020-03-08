import {Module} from "@tsed/di";
import {Command} from "commander";
import {join, resolve} from "path";
import * as UpdateNotifier from "update-notifier";
import {CliConfiguration} from "./services/CliConfiguration";
import {CliPackageJson} from "./services/CliPackageJson";
import {CliService} from "./services/CliService";
import {ProjectPackageJson} from "./services/ProjectPackageJson";
import {RenderService} from "./services/RenderService";
import {createInjector} from "./utils/createInjector";
import {loadInjector} from "./utils/loadInjector";
import {loadPlugins} from "./utils/loadPlugins";

@Module({
  imports: [CliPackageJson, ProjectPackageJson, CliService, CliConfiguration, RenderService]
})
export class Cli {
  constructor(@CliPackageJson() readonly pkg: CliPackageJson, private cliService: CliService) {
    UpdateNotifier({pkg, updateCheckInterval: 0}).notify();
  }

  static async bootstrap(settings: TsED.Configuration): Promise<Cli> {
    const injector = createInjector({
      ...settings,
      project: {
        root: this.getProjectRoot(),
        srcDir: "src",
        ...(settings.project || {})
      }
    });

    await loadPlugins(injector);

    await loadInjector(injector, Cli);

    await injector.emit("$onReady");

    return injector.get<Cli>(Cli)!;
  }

  static getProjectRoot(argv = process.argv) {
    if (!argv.includes("-h")) {
      const projectRoot = new Command().option("-r, --project-root <path>", "Project root directory").parse(argv).projectRoot || "";

      return resolve(join(process.cwd(), projectRoot));
    }
    return process.cwd();
  }

  parseArgs(args = process.argv) {
    this.cliService.parseArgs(args);
  }
}
