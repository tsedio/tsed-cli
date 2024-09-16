import {InitCmdContext} from "@tsed/cli";
import {CliDockerComposeYaml, Inject, OnExec, ProjectPackageJson, RootRendererService, SrcRendererService} from "@tsed/cli-core";
import {Injectable} from "@tsed/di";

import {CliMongoose} from "../services/CliMongoose.js";

@Injectable()
export class MongooseInitHook {
  @Inject()
  cliMongoose: CliMongoose;

  @Inject()
  protected packageJson: ProjectPackageJson;

  @Inject()
  protected rootRenderer: RootRendererService;

  @Inject()
  protected srcRenderer: SrcRendererService;

  @Inject()
  protected cliDockerComposeYaml: CliDockerComposeYaml;

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
