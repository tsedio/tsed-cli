import {defineTemplate} from "../utils/defineTemplate.js";
import type {CreateTemplateCmdContext} from "../commands/template/CreateTemplateCommand.js";
import type {SourceFile} from "ts-morph";

declare global {
  namespace TsED {
    interface GenerateOptions extends Record<string, any> {
      templateId: string;
      name: string;
    }
  }
}

defineTemplate({
  id: "new-template",
  label: "New Template",
  fileName: "{{symbolName}}.template",
  preserveCase: true,
  outputDir: "./.templates",
  hidden: true,
  render(_: string, context: CreateTemplateCmdContext) {
    if (context.from === "new") {
      return `import {defineTemplate} from "@tsed/cli";
    
export default defineTemplate({
  id: "${context.templateId}",
  label: "${context.name}",
  fileName: "{{symbolName}}.services",
  outputDir: "{{srcDir}}/services",
  render(symbolName, context) {
    return \`export class \${symbolName} {}\`;
  }
});`;
    }

    if (context.template) {
      const {id, ...props} = context.template;
      const render = props.render.toString();

      if (render.includes(""))
        return `import {defineTemplate} from "@tsed/cli";      
    
defineTemplate({
  id: "${context.override ? id! : context.templateId}",
  label: "${context.name}",
  fileName: "${props.fileName}",
  outputDir: "${props.outputDir}",
  ${props.prompts ? `${props.prompts.toString()},` : ""}
  ${props.render.toString()}
});`;
    }
  },
  hooks: {
    $afterCreateSourceFile(sourceFile: SourceFile) {
      const sourceFileText = sourceFile.getFullText();

      if (sourceFileText.includes("camelCase")) {
        sourceFile.addImportDeclaration({
          namedImports: ["camelCase"],
          moduleSpecifier: "change-case"
        });
      }

      if (sourceFileText.includes("pascalCase")) {
        sourceFile.addImportDeclaration({
          namedImports: ["pascalCase"],
          moduleSpecifier: "change-case"
        });
      }

      if (sourceFileText.includes("kebabCase")) {
        sourceFile.addImportDeclaration({
          namedImports: ["kebabCase"],
          moduleSpecifier: "change-case"
        });
      }

      sourceFile.formatText({
        indentSize: 2
      });
      sourceFile.saveSync();

      return sourceFile;
    }
  }
});
