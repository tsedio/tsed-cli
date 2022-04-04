import {InitCmdContext} from "@tsed/cli";
import {
  CliDockerComposeYaml,
  CliService,
  Inject,
  OnExec,
  ProjectPackageJson,
  RootRendererService,
  SrcRendererService
} from "@tsed/cli-core";
import {Injectable} from "@tsed/di";
import {pascalCase} from "change-case";

function getDatabase(ctx: InitCmdContext) {
  return ctx.features.find(({type}) => type.includes("typeorm:"))?.type.split(":")[1] || "";
}

@Injectable()
export class TypeORMInitHook {
  @Inject()
  protected cliService: CliService;

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

    const database = getDatabase(ctx);

    if (!database) {
      return [];
    }

    return this.cliService.getTasks("generate", {
      ...ctx,
      type: "typeorm:dataSource",
      name: pascalCase(database),
      typeormDataSource: ctx.features.find(({type}) => type.startsWith("typeorm:"))?.type
    });
  }

  addScripts() {
    this.packageJson.addScripts({
      typeorm: "typeorm-ts-node-commonjs"
    });
  }

  addDependencies(ctx: InitCmdContext) {
    this.packageJson.addDependencies({}, ctx);
  }

  addDevDependencies(ctx: InitCmdContext) {
    this.packageJson.addDevDependencies({}, ctx);
  }
}
