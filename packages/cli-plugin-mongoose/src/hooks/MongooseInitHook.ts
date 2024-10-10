import type {InitCmdContext} from "@tsed/cli";
import {CliDockerComposeYaml, inject, OnExec, ProjectPackageJson} from "@tsed/cli-core";
import {Injectable} from "@tsed/di";

import {CliMongoose} from "../services/CliMongoose.js";

@Injectable()
export class MongooseInitHook {
  protected cliMongoose = inject(CliMongoose);
  protected packageJson = inject(ProjectPackageJson);
  protected cliDockerComposeYaml = inject(CliDockerComposeYaml);

  @OnExec("init")
  onExec(ctx: InitCmdContext) {
    this.addScripts();
    this.addDependencies(ctx);
    this.addDevDependencies(ctx);

    return [
      {
        title: "Generate Mongoose configuration",
        task: () =>
          this.cliMongoose.writeConfig("default", {
            symbolName: "MONGOOSE_DEFAULT"
          })
      },
      {
        title: "Generate docker-compose configuration",
        task: () => this.cliDockerComposeYaml.addDatabaseService("mongodb", "mongodb")
      }
    ];
  }

  addScripts() {
    this.packageJson.addScripts({});
  }

  addDependencies(ctx: InitCmdContext) {
    this.packageJson.addDependencies({}, ctx);
  }

  addDevDependencies(ctx: InitCmdContext) {
    this.packageJson.addDevDependencies({}, ctx);
  }
}
