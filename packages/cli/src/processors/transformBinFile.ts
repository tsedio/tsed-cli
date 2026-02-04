import {dirname, join, relative} from "node:path";

import {normalizePath} from "@tsed/normalize-path";
import {SyntaxKind} from "ts-morph";

import type {RenderDataContext} from "../interfaces/RenderDataContext.js";
import type {ProjectClient} from "../services/ProjectClient.js";

export function transformBinFile(project: ProjectClient, data: RenderDataContext) {
  const binSourceFile = project.binSourceFile;
  const options = project.findConfiguration("bin");

  if (!binSourceFile || !options) {
    return;
  }
  // list all commands in the bin/commands directory
  const files = project.fs.globSync([normalizePath(project.rootDir, "src/bin/commands/*.ts")]);

  const commands = files
    .map((file) => {
      const source = project.getSourceFile(file);

      if (!source) {
        return undefined;
      }

      const command = source?.getClasses().find((cls) => {
        return cls.getDecorators().some((decorator) => {
          return decorator.getName() === "Command" && decorator.getArguments().length > 0;
        });
      });

      return command ? {command, file: source.getFilePath()} : undefined;
    })
    .filter((f) => f !== undefined)
    .map(({file, command}) => {
      binSourceFile!.addImportDeclaration({
        moduleSpecifier: "./" + relative(dirname(binSourceFile.getFilePath()), file).replace(".ts", ".js"),
        namedImports: [command.getName()!]
      });

      return command.getName()!;
    })
    .sort();

  const list = project.getPropertyAssignment(options!, {
    name: "commands",
    kind: SyntaxKind.ArrayLiteralExpression,
    initializer: "[]"
  });

  const existingElements = list.getElements();

  commands
    .filter((command) => {
      return !existingElements.some((element) => element.getText() === command);
    })
    .forEach((command) => {
      list.addElement(command);
    });
}
