import {createSubTasks} from "../utils/createTasksRunner";
import chalk from "chalk";
import {Constant, Inject, Injectable, InjectorService} from "@tsed/di";
import {CommandStoreKeys} from "../domains/CommandStoreKeys";
import {loadPlugins} from "../utils/loadPlugins";
import {CliHooks} from "./CliHooks";
import {NpmRegistryClient} from "./NpmRegistryClient";
import {ProjectPackageJson} from "./ProjectPackageJson";

function mapPlugins({package: {name, description = "", ...otherProps}}: any) {
  return {
    name: `${name} ${description}`.trim(),
    value: name,
    ...otherProps
  };
}

@Injectable()
export class CliPlugins {
  @Constant("name")
  name: string;

  @Inject()
  private npmRegistryClient: NpmRegistryClient;

  @Inject()
  private injector: InjectorService;

  @Inject()
  private cliHooks: CliHooks;

  @Inject()
  private packageJson: ProjectPackageJson;

  async searchPlugins(keyword = "", options: any = {}) {
    const result = await this.npmRegistryClient.search(this.getKeyword(keyword), options);

    return result.filter(({package: {name}}: any) => this.isPlugin(name)).map(mapPlugins);
  }

  async loadPlugins() {
    return loadPlugins(this.injector);
  }

  addPluginsDependencies(ctx: any) {
    const plugins = Object.keys(this.packageJson.devDependencies).filter((name) => this.isPlugin(name));

    const tasks = plugins.map((plugin) => {
      return {
        title: `Run plugin '${chalk.cyan(plugin)}'`,
        task: () => this.cliHooks.emit(CommandStoreKeys.ADD, plugin)
      };
    });

    return [
      ...tasks,
      {
        title: "Install",
        task: createSubTasks(() => this.packageJson.install(ctx), {...ctx, concurrent: false})
      }
    ];
  }

  protected getKeyword(keyword: string) {
    return `@${this.name}/cli-plugin-${this.cleanKeyword(keyword)}`;
  }

  protected cleanKeyword(keyword: string) {
    return keyword.replace(this.name, "").replace("@", "").replace("/", "").replace("cli-plugin-", "");
  }

  private isPlugin(name: any) {
    return name.startsWith(`@${this.name}/cli-plugin`) || name.startsWith(`${this.name}-cli-plugin`);
  }
}
