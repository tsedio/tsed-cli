import {constant, inject, injectable} from "@tsed/di";
import {$asyncEmit} from "@tsed/hooks";
import chalk from "chalk";

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

export class CliPlugins {
  name = constant<string>("name", "");
  readonly loadPlugins = loadPlugins;
  private npmRegistryClient = inject(NpmRegistryClient);
  private cliHooks = inject(CliHooks);
  private packageJson = inject(ProjectPackageJson);
  private packageManagers = inject(PackageManagersModule);

  async searchPlugins(keyword = "", options: any = {}) {
    const result = await this.npmRegistryClient.search(this.getKeyword(keyword), options);

    return result.filter(({package: {name}}: any) => this.isPlugin(name)).map(mapPlugins);
  }

  addPluginsDependencies(ctx: any): Task[] {
    const plugins = Object.keys(this.packageJson.devDependencies).filter((name) => this.isPlugin(name));

    const tasks = plugins.map((plugin) => {
      return {
        title: `Run plugin '${chalk.cyan(plugin)}'`,
        task: () => {
          return $asyncEmit("$onAddPlugin", [plugin, ctx]);
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

injectable(CliPlugins);
