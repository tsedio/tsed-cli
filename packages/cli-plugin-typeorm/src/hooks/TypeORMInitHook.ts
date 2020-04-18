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
import {CliTypeORM} from "../services/CliTypeORM";

function getDatabase(ctx: IInitCmdContext) {
  return ctx.features.find(({type}) => type.includes("typeorm:"))?.type.split(":")[1] || "";
}

@Injectable()
export class TypeORMInitHook {
  @Inject()
  cliTypeORM: CliTypeORM;

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

    const database = getDatabase(ctx);

    if (!database) {
      return [];
    }

    return [
      {
        title: `Generate TypeORM connection file`,
        task: async () => this.cliTypeORM.generateConnection("default", {
          symbolPath: "DefaultConnection",
          symbolName: "DefaultConnection"
        })
      },
      {
        title: "Generate TypeORM configuration",
        task: async () => this.cliTypeORM.writeConfig("default", database)
      },
      {
        title: "Generate docker-compose configuration",
        task: async () => this.cliDockerComposeYaml.addDatabaseService(database, database)
      }
    ];
  }

  addScripts(ctx: IInitCmdContext) {
    this.packageJson.addScripts({
      "typeorm": "tsed typeorm"
    });
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
