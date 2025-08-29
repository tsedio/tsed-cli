import {type CliCommandHooks, ProjectClient, type RenderDataContext} from "@tsed/cli";
import {inject, injectable} from "@tsed/di";

import {CliMongoose} from "../services/CliMongoose.js";

export class MongooseInitHook implements CliCommandHooks {
  protected cliMongoose = inject(CliMongoose);

  async $alterProjectFiles(project: ProjectClient, data: RenderDataContext): Promise<ProjectClient> {
    if (data.commandName === "init" && data.mongoose) {
      project.serverSourceFile?.addImportDeclaration({
        moduleSpecifier: "@tsed/mongoose"
      });

      await project.dockerCompose.addDatabaseService("mongodb", "mongodb");

      await this.cliMongoose.createMongooseConnection(project, "MONGOOSE_DEFAULT");
      this.cliMongoose.updateConfigFile(project, data);
    }

    return project;
  }
}

injectable(MongooseInitHook);
