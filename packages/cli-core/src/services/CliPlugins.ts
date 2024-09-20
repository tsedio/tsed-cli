import {Constant, Inject, Injectable, InjectorService} from "@tsed/di";
import chalk from "chalk";

import {CommandStoreKeys} from "../domains/CommandStoreKeys.js";
import type {Task} from "../interfaces/index.js";
import {PackageManagersModule} from "../packageManagers/PackageManagersModule.js";
import {createSubTasks} from "../utils/createTasksRunner.js";
import {loadPlugins} from "../utils/loadPlugins.js";
import {CliHooks} from "./CliHooks.js";
import {NpmRegistryClient} from "./NpmRegistryClient.js";
import {ProjectPackageJson} from "./ProjectPackageJson.js";

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

  @Inject(NpmRegistryClient)
  private npmRegistryClient: NpmRegistryClient;

  @Inject(InjectorService)
  private injector: InjectorService;

  @Inject(CliHooks)
  private cliHooks: CliHooks;

  @Inject(ProjectPackageJson)
  private packageJson: ProjectPackageJson;

  @Inject(PackageManagersModule)
  private packageManagers: PackageManagersModule;

  async searchPlugins(keyword = "", options: any = {}) {
    const result = await this.npmRegistryClient.search(this.getKeyword(keyword), options);

    return result.filter(({package: {name}}: any) => this.isPlugin(name)).map(mapPlugins);
  }

  loadPlugins() {
    return loadPlugins(this.injector);
  }

  addPluginsDependencies(ctx: any): Task[] {
    const plugins = Object.keys(this.packageJson.devDependencies).filter((name) => this.isPlugin(name));

    const tasks = plugins.map((plugin) => {
      return {
        title: `Run plugin '${chalk.cyan(plugin)}'`,
        task: () => {
          return this.cliHooks.emit(CommandStoreKeys.ADD, plugin, ctx);
        }
      };
    });

    return [
      ...tasks,
      {
        title: "Install",
        task: createSubTasks(
          () => {
            return this.packageManagers.install(ctx);
          },
          {...ctx, concurrent: false}
        )
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
    return name.startsWith(`@${this.name}/cli-plugin`) || name.includes(`${this.name}-cli-plugin`);
  }
}
