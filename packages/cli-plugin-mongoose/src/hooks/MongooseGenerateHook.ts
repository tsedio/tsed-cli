import {type AlterGenerateTasks, type AlterProjectFiles, type GenerateCmdContext, ProjectClient} from "@tsed/cli";
import {CliDockerComposeYaml, inject, ProjectPackageJson, type Task} from "@tsed/cli-core";
import {injectable} from "@tsed/di";

import {CliMongoose} from "../services/CliMongoose.js";

export class MongooseGenerateHook implements AlterGenerateTasks, AlterProjectFiles {
  protected projectPackageJson = inject(ProjectPackageJson);
  protected cliMongoose = inject(CliMongoose);
  protected packages: any[];
  protected cliDockerComposeYaml = inject(CliDockerComposeYaml);

  $alterGenerateTasks(tasks: Task[], data: GenerateCmdContext): Task[] | Promise<Task[]> {
    return [
      ...tasks,
      {
        title: "Generate docker-compose configuration",
        skip: (ctx: GenerateCmdContext) => ctx.type !== "mongoose.connection",
        task: () => this.cliDockerComposeYaml.addDatabaseService(data.name, "mongodb")
      }
    ];
  }

  $alterProjectFiles(project: ProjectClient, data: GenerateCmdContext): Promise<ProjectClient> | ProjectClient {
    if (data.commandName === "generate" && data.type === "mongoose.connection") {
      this.cliMongoose.updateMongooseConfig(project, data.symbolName);
    }

    return project;
  }
}

injectable(MongooseGenerateHook);
