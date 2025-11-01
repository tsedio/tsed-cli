import {SyntaxKind} from "ts-morph";

import {ArchitectureConvention} from "../interfaces/index.js";
import type {RenderDataContext} from "../interfaces/RenderDataContext.js";
import type {ProjectClient} from "../services/ProjectClient.js";

export function transformServerFile(project: ProjectClient, data: RenderDataContext) {
  const isFeature = data.architecture === ArchitectureConvention.FEATURE;
  const sourceFile = project.serverSourceFile!;
  const options = project.findConfiguration("server");

  if (!options) {
    return;
  }

  if (data.commandName === "init") {
    sourceFile.addImportDeclaration({
      moduleSpecifier: "@tsed/platform-" + data.platform.toLowerCase()
    });
  }

  if (data.swagger) {
    sourceFile.addImportDeclaration({
      moduleSpecifier: "@tsed/swagger"
    });

    project.getPropertyAssignment(options, {
      name: "swagger",
      kind: SyntaxKind.ArrayLiteralExpression,
      initializer: JSON.stringify(
        [
          {
            path: "/doc",
            specVersion: "3.1.0"
          }
        ],
        null,
        2
      )
    });
  }

  if (data.scalar) {
    sourceFile.addImportDeclaration({
      moduleSpecifier: "@tsed/scalar"
    });

    project.getPropertyAssignment(options, {
      name: "scalar",
      kind: SyntaxKind.ArrayLiteralExpression,
      initializer: JSON.stringify(
        [
          {
            path: "/scalar/doc",
            specVersion: "3.1.0"
          }
        ],
        null,
        2
      )
    });
  }

  if (data.commandName === "init") {
    sourceFile.addImportDeclaration({
      moduleSpecifier: "./config/index.js",
      namedImports: [{name: "config"}]
    });
    project.addNamespaceImport(sourceFile, isFeature ? "./rest/index.js" : "./controllers/rest/index.js", "rest");

    project.addMountPath(data.route || "/rest", "...Object.values(rest)");

    if (data.swagger || data.oidc) {
      sourceFile.addImportDeclaration({
        moduleSpecifier: isFeature ? "./pages/index.js" : "./controllers/pages/index.js",
        namespaceImport: "pages"
      });

      project.addMountPath("/", "...Object.values(pages)");
    }
  }
}
