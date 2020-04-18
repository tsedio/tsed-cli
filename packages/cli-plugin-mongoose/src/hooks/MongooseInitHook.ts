import {IInitCmdContext} from "@tsed/cli";
import {
  CliDockerComposeYaml,
  Inject,
  OnExec,
  ProjectPackageJson,
  RootRendererService,
  SrcRendererService
} from "@tsed/cli-core";
import {Injectable} from "@tsed/di";
import {CliMongoose} from "../services/CliMongoose";

function getDatabase(ctx: IInitCmdContext) {
  return ctx.features.find(({type}) => type.includes("typeorm:"))?.type.split(":")[1] || "";
}

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
  onExec(ctx: IInitCmdContext) {
    this.addScripts(ctx);
    this.addDependencies(ctx);
    this.addDevDependencies(ctx);

    return [
      {
        title: "Generate Mongoose configuration",
        task: async () => this.cliMongoose.writeConfig("default", {
          symbolName: "MONGOOSE_DEFAULT"
        })
      },
      {
        title: "Generate docker-compose configuration",
        task: async () => this.cliDockerComposeYaml.addDatabaseService("mongodb", "mongodb")
      }
    ];
  }

  addScripts(ctx: IInitCmdContext) {
    this.packageJson.addScripts({});
  }

  addDependencies(ctx: IInitCmdContext) {
    this.packageJson.addDependencies({}, ctx);
  }

  addDevDependencies(ctx: IInitCmdContext) {
    this.packageJson.addDevDependencies(
      {},
      ctx
    );
  }
}
