import {type AlterGenerateTasks, type GenerateCmdContext} from "@tsed/cli";
import {CliDockerComposeYaml, ProjectPackageJson, type Task} from "@tsed/cli-core";
import {inject, injectable} from "@tsed/di";

import {getDatabase, getTypeORMDatabases} from "../utils/getTypeORMDatabases.js";

export class TypeORMGenerateHook implements AlterGenerateTasks {
  protected projectPackageJson = inject(ProjectPackageJson);
  protected cliDockerComposeYaml = inject(CliDockerComposeYaml);

  $alterGenerateTasks(tasks: Task[], data: GenerateCmdContext): Task[] | Promise<Task[]> {
    const {typeormDataSource, name} = data;

    if (typeormDataSource) {
      getTypeORMDatabases()
        .filter(([value]) => value === typeormDataSource)
        .forEach(([, feature]) => {
          if (feature.dependencies) {
            this.projectPackageJson.addDependencies(feature.dependencies);
          }
          if (feature.devDependencies) {
            this.projectPackageJson.addDependencies(feature.devDependencies);
          }
        });
    }

    return [
      ...tasks,
      {
        title: "Generate docker-compose configuration",
        enabled: () => !!typeormDataSource,
        task: () => this.cliDockerComposeYaml.addDatabaseService(name, getDatabase(data))
      }
    ];
  }
}

injectable(TypeORMGenerateHook);
