import {IInitCmdContext} from "@tsed/cli";
import {Inject, OnExec, ProjectPackageJson, RootRendererService, SrcRendererService} from "@tsed/cli-core";
import {Injectable} from "@tsed/di";
import {CliTypeORM} from "../services/CliTypeORM";

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

  @OnExec("init")
  onExec(ctx: IInitCmdContext) {
    this.addScripts(ctx);
    this.addDependencies(ctx);
    this.addDevDependencies(ctx);

    const database = ctx.featuresTypeORM?.type.split(":")[1] || "";

    return [
      {
        title: `Generate TypeORM connection file`,
        skip: !!database,
        task: async () => this.cliTypeORM.generateConnection("default", {
          symbolPath: "DefaultConnection",
          symbolName: "DefaultConnection"
        })
      },
      {
        title: "Generate TypeORM configuration",
        skip: !!database,
        task: async () => this.cliTypeORM.writeOrmConfigTemplate("default", database)
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
