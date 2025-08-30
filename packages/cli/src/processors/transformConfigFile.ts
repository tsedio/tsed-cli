import {SyntaxKind} from "ts-morph";

import type {RenderDataContext} from "../interfaces/RenderDataContext.js";
import type {ProjectClient} from "../services/ProjectClient.js";

export function transformConfigFile(project: ProjectClient, data: RenderDataContext) {
  const sourceFile = project.configSourceFile!;
  const options = project.findConfiguration("config");

  if (!options) {
    return;
  }

  if (data.config) {
    // const extendsConfig = project.getPropertyAssignment(options, {
    //   name: "extends",
    //   kind: SyntaxKind.ObjectLiteralExpression,
    //   initializer: "[]"
    // });
    //
    // if (data.configEnvs) {
    //   sourceFile.addImportDeclaration({
    //     moduleSpecifier: "@tsed/config/envs",
    //     namedImports: [{name: "EnvsConfigSource"}]
    //   });
    // }
  }

  sourceFile.organizeImports();
  sourceFile.formatText({
    indentSize: 2
  });
}
