import {InitCmdContext} from "@tsed/cli";
import {CliDockerComposeYaml, Inject, OnExec, ProjectPackageJson, RootRendererService, SrcRendererService} from "@tsed/cli-core";
import {Injectable} from "@tsed/di";
import {TEMPLATE_DIR} from "../utils/templateDir";

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
        title: "Generate files",
        task: async () =>
          this.rootRenderer.renderAll(
            [
              "/src/config/oidc/index.ts.hbs",
              "/src/controllers/oidc/InteractionsCtrl.ts",
              "/src/interactions/ConsentInteraction.ts",
              "/src/interactions/CustomInteraction.ts",
              "/src/interactions/LoginInteraction.ts",
              "/src/models/Account.ts",
              "/src/services/Accounts.ts",
              "/views/forms/interaction-form.ejs",
              "/views/forms/login-form.ejs",
              "/views/forms/select-account-form.ejs",
              "/views/partials/footer.ejs",
              "/views/partials/header.ejs",
              "/views/partials/login-help.ejs",
              "/views/interaction.ejs",
              "/views/login.ejs",
              "/views/repost.ejs",
              "/views/select_account.ejs"
            ],
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
