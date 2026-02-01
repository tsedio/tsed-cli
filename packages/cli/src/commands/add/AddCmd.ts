import {
  CliPlugins,
  command,
  type CommandProvider,
  inject,
  PackageManagersModule,
  ProjectPackageJson,
  type PromptQuestion,
  type Task
} from "@tsed/cli-core";

export interface AddCmdOptions extends CommandProvider {
  name: string;
}

export class AddCmd implements CommandProvider {
  protected cliPlugins = inject(CliPlugins);
  protected packageJson = inject(ProjectPackageJson);
  protected packageManagers = inject(PackageManagersModule);

  $prompt(initialOptions: any): PromptQuestion[] {
    return [
      {
        type: "autocomplete",
        name: "name",
        message: "Which cli plugin ?",
        default: initialOptions.name,
        when: !initialOptions.name,
        source: () => this.cliPlugins.searchPlugins()
      }
    ];
  }

  $exec(ctx: AddCmdOptions): Task[] {
    this.packageJson.addDevDependency(ctx.name, "latest");

    return [
      this.packageManagers.task("Install plugins", ctx),
      {
        title: "Load plugins",
        task: () => this.cliPlugins.loadPlugins()
      },
      {
        title: "Install plugins dependencies",
        task: () => this.cliPlugins.addPluginsDependencies(ctx)
      },
      {
        title: "Transform files",
        task: () => this.cliPlugins.addPluginsDependencies(ctx)
      }
    ];
  }
}

command({
  token: AddCmd,
  name: "add",
  description: "Add cli plugin to the current project",
  args: {
    name: {
      description: "Npm package name of the cli plugin",
      type: String
    }
  }
});
