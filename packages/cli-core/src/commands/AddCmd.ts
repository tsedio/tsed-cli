import {Inject} from "@tsed/di";
import {Command} from "../decorators/command";
import {ICommand, QuestionOptions} from "../interfaces/ICommand";
import {CliPlugins} from "../services/CliPlugins";
import {ProjectPackageJson} from "../services/ProjectPackageJson";

export interface IAddCmdOptions {
  name: string;
}

@Command({
  name: "add",
  description: "Add cli plugin to the current project",
  args: {
    name: {
      description: "Npm package name of the cli plugin",
      type: String
    }
  }
})
export class AddCmd implements ICommand {
  @Inject(CliPlugins)
  cliPlugins: CliPlugins;

  @Inject(ProjectPackageJson)
  projectPackageJson: ProjectPackageJson;

  $prompt(initialOptions: any): QuestionOptions {
    return [
      {
        type: "autocomplete",
        name: "name",
        message: "Which cli plugin ?",
        default: initialOptions.name,
        when: !initialOptions.name,
        source: async (state: any, keyword: string) => {
          return this.cliPlugins.searchPlugins(keyword);
        }
      }
    ];
  }

  async $exec(options: IAddCmdOptions) {
    this.projectPackageJson.addDevDependency(options.name);

    return [];
  }
}
