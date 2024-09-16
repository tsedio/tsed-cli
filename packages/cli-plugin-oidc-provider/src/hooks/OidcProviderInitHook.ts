import {InitCmdContext} from "@tsed/cli";
import {CliDockerComposeYaml, Inject, OnExec, ProjectPackageJson, RootRendererService, SrcRendererService} from "@tsed/cli-core";
import {Injectable} from "@tsed/di";

import {TEMPLATE_DIR} from "../utils/templateDir.js";

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
    return [
      {
        title: "Generate OIDC files",
        task: () =>
          this.rootRenderer.renderAll(
            [
              "/src/config/oidc/index.ts.hbs",
              "/src/controllers/oidc/InteractionsController.ts",
              ctx.jest && "/src/controllers/oidc/InteractionsController.spec.ts",
              "/src/interactions/ConsentInteraction.ts",
              ctx.jest && "/src/interactions/ConsentInteraction.spec.ts",
              "/src/interactions/CustomInteraction.ts",
              "/src/interactions/LoginInteraction.ts",
              ctx.jest && "/src/interactions/LoginInteraction.spec.ts",
              ctx.jest && "/src/interactions/__mock__/oidcContext.fixture.ts",
              "/src/models/Account.ts",
              "/src/services/Accounts.ts",
              "/views/forms/consent-form.ejs",
              "/views/forms/login-form.ejs",
              "/views/forms/select-account-form.ejs",
              "/views/partials/footer.ejs",
              "/views/partials/header.ejs",
              "/views/partials/login-help.ejs",
              "/views/consent.ejs",
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
}
