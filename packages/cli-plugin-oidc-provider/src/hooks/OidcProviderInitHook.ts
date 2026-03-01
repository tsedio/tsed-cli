import {type CliCommandHooks, ProjectClient, render, type RenderDataContext} from "@tsed/cli";
import {injectable} from "@tsed/di";
import {SyntaxKind} from "ts-morph";

import {TEMPLATE_DIR} from "../utils/templateDir.js";

export class OidcProviderInitHook implements CliCommandHooks {
  $alterBarrels(barrels: any) {
    barrels.directory.push("./src/interactions");

    return barrels;
  }

  $alterRenderFiles(files: string[], data: RenderDataContext) {
    if (!data.oidc) {
      return files;
    }

    return [
      ...files,
      ...[
        "/src/controllers/oidc/InteractionsController.ts",
        data.testing && "/src/controllers/oidc/InteractionsController.spec.ts",
        "/src/interactions/ConsentInteraction.ts",
        data.testing && "/src/interactions/ConsentInteraction.spec.ts",
        "/src/interactions/CustomInteraction.ts",
        "/src/interactions/LoginInteraction.ts",
        data.testing && "/src/interactions/LoginInteraction.spec.ts",
        data.testing && "/src/interactions/__mock__/oidcContext.fixture.ts",
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
      ]
        .filter(Boolean)
        .map((path: string) => {
          return {
            id: path,
            from: TEMPLATE_DIR
          };
        })
    ];
  }

  async $alterProjectFiles(project: ProjectClient, data: RenderDataContext) {
    if (!data.oidc) {
      return project;
    }

    await render("oidc-provider.index", {
      ...data,
      name: "index"
    });

    this.updateServerFile(project);
    this.updateConfigFile(project);

    return project;
  }

  private updateServerFile(project: ProjectClient) {
    const sourceFile = project.serverSourceFile!;

    sourceFile.addImportDeclaration({
      moduleSpecifier: "@tsed/oidc-provider"
    });

    const importDeclaration = sourceFile.addImportDeclaration({
      moduleSpecifier: "./controllers/oidc/InteractionsController.js",
      namedImports: [{name: "InteractionsController"}]
    });

    importDeclaration.getNamedImports().find((value) => value.getName() === "InteractionsController");

    project.addMountPath("/", "InteractionsController");
  }

  private updateConfigFile(project: ProjectClient) {
    const sourceFile = project.configSourceFile!;
    const options = project.findConfiguration("config");

    if (!options) {
      return;
    }

    sourceFile.addImportDeclaration({
      moduleSpecifier: "./oidc/index.js",
      defaultImport: "oidcConfig"
    });
    sourceFile.addImportDeclaration({
      moduleSpecifier: "@tsed/adapters",
      namedImports: [{name: "FileSyncAdapter"}]
    });

    project.getPropertyAssignment(options, {
      name: "oidc",
      kind: SyntaxKind.Identifier,
      initializer: "oidcConfig"
    });

    project
      .getPropertyAssignment(options, {
        name: "adapters",
        kind: SyntaxKind.ArrayLiteralExpression,
        initializer: "[]"
      })
      .addElement("FileSyncAdapter");

    return project;
  }
}

injectable(OidcProviderInitHook);
