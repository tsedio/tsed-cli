import {ts} from "@ts-morph/common";
import {pascalCase} from "change-case";

import type {RenderDataContext} from "../interfaces/RenderDataContext.js";
import type {ProjectClient} from "../services/ProjectClient.js";
import SyntaxKind = ts.SyntaxKind;

export function transformIndexFile(project: ProjectClient, data: RenderDataContext) {
  const sourceFile = project.indexSourceFile!;

  sourceFile.addImportDeclaration({
    moduleSpecifier: "./" + project.serverName.replace(".ts", ".js"),
    namedImports: ["Server"]
  });

  const platformName = "Platform" + pascalCase(data.platform);

  sourceFile.addImportDeclaration({
    moduleSpecifier: "@tsed/platform-" + data.platform.toLowerCase(),
    namedImports: [platformName]
  });

  sourceFile.getImportDeclaration((declaration) => declaration.getModuleSpecifierValue() === "@tsed/platform-http")?.remove();

  sourceFile.getDescendantsOfKind(SyntaxKind.Identifier).map((identifier) => {
    if (identifier.getText() === "PlatformBuilder") {
      identifier.replaceWithText(identifier.getText().replace("PlatformBuilder", platformName));

      return identifier.rename(platformName);
    }
    return identifier;
  });
}
