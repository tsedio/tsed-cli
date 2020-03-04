import {GlobalProviderRegistry, GlobalProviders, InjectorService, Module, Provider} from "@tsed/di";
import {Command} from "commander";
import {join, resolve} from "path";
import * as UpdateNotifier from "update-notifier";
import * as Pipes from "./pipes";
import {CliConfiguration} from "./services/CliConfiguration";
import {CliPackageJson} from "./services/CliPackageJson";
import {CliService} from "./services/CliService";
import {ProjectPackageJson} from "./services/ProjectPackageJson";
import {RenderService} from "./services/RenderService";
import {createInjector} from "./utils/createInjector";
import {importModule} from "./utils/importModule";
import {loadInjector} from "./utils/loadInjector";

@Module({
  imports: [CliPackageJson, ProjectPackageJson, CliService, CliConfiguration, RenderService, ...Object.values(Pipes)]
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

    await this.loadPlugins(injector);

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

  private static async loadPlugins(injector: InjectorService) {
    const {
      project: {root}
    } = injector.settings;
    const projectPackageJson = injector.invoke<ProjectPackageJson>(ProjectPackageJson);

    const localDi = await importModule("@tsed/di", root);
    const localGlobalProviders = localDi.GlobalProviders as GlobalProviderRegistry;

    const add = (token: Provider<any>) => injector.add(token, localGlobalProviders.get(token)?.clone());
    const promises = Object.keys(projectPackageJson.dependencies)
      .concat(Object.keys(projectPackageJson.devDependencies))
      .filter(mod => mod.startsWith("@tsed/cli-plugin") || mod.startsWith("tsed-cli-plugin"))
      .map(async mod => {
        const {default: plugin} = await importModule(mod, root);

        if (!GlobalProviders.has(plugin) && localGlobalProviders.has(plugin)) {
          const provider = localGlobalProviders.get(plugin)?.clone();

          if (provider?.imports.length) {
            provider?.imports.forEach(add);
          }
          add(plugin);
        }
      });

    return Promise.all(promises);
  }

  parseArgs(args = process.argv) {
    this.cliService.parseArgs(args);
  }
}
