import {InitCmdContext} from "@tsed/cli";
import {CliDockerComposeYaml, Inject, OnExec, ProjectPackageJson, RootRendererService, SrcRendererService} from "@tsed/cli-core";
import {Injectable} from "@tsed/di";
import {TEMPLATE_DIR} from "../utils/templateDir";
import {copy} from "fs-extra";
import {join} from "path";

@Injectable()
export class OidcProviderInitHook {
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
        title: "Copy views",
        task: async () => {
          return copy(join(TEMPLATE_DIR, "init/views"), join(this.srcRenderer.rootDir, "views"));
        }
      },
      {
        title: "Generate files",
        task: async () =>
          this.rootRenderer.renderAll(
            [
              "/src/config/oidc/index.ts.hbs",
              "/src/controllers/oidc/InteractionsCtrl.ts.hbs",
              "/src/interactions/ConsentInteraction.ts",
              "/src/interactions/CustomInteraction.ts",
              "/src/interactions/LoginInteraction.ts",
              "/src/models/Account.ts",
              "/src/services/Accounts.ts"
            ].filter(Boolean),
            ctx,
            {
              templateDir: `${TEMPLATE_DIR}/init`
            }
          )
      }
    ];
  }

  addScripts() {}

  addDependencies(ctx: InitCmdContext) {
    this.packageJson.addDependencies({}, ctx);
  }

  addDevDependencies(ctx: InitCmdContext) {
    this.packageJson.addDevDependencies({}, ctx);
  }
}
