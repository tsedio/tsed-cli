import {defineTemplate, type GenerateCmdContext, ProjectClient, render, type RenderDataContext} from "@tsed/cli";
import {inject} from "@tsed/di";
import {PassportClient} from "../services/PassportClient.js";
import {ProjectPackageJson, type Task} from "@tsed/cli-core";

declare global {
  namespace TsED {
    export interface GenerateOptions {
      passportPackage: string;
    }

    interface RenderDataContext {
      passport?: boolean;
    }
  }
}

export default defineTemplate({
  id: "protocol",
  label: "Passport Protocol",
  fileName: "{{symbolName}}.protocol",
  outputDir: "{{srcDir}}/protocols",

  prompts() {
    return [
      {
        type: "autocomplete",
        name: "passportPackage",
        message: "Which passport package ?",
        when(state) {
          return ["protocol"].includes(state.type);
        },
        source(_, input): Promise<any[]> {
          return inject(PassportClient).getChoices(input);
        }
      }
    ];
  },

  async render(_: string, data: GenerateCmdContext) {
    const result = await render("protocol." + data.passportPackage, data);
    return result || render("protocol.generic", data);
  },

  hooks: {
    $alterProjectFiles(_, project: ProjectClient, data: RenderDataContext): ProjectClient | Promise<ProjectClient> {
      const sourceFile = project.serverSourceFile!;

      if (data.passport) {
        sourceFile.addImportDeclaration({
          moduleSpecifier: "@tsed/passport"
        });
      }

      return project;
    },

    async $alterPackageJson(_, packageJson: ProjectPackageJson, data: RenderDataContext) {
      if (data.passport) {
        packageJson.addDependencies({
          "@tsed/passport": packageJson.dependencies["@tsed/platform-http"],
          passport: "latest"
        });

        packageJson.addDevDependencies({
          "@types/passport": "latest"
        });
      }

      return packageJson;
    },

    async $alterGenerateTasks(_, tasks: Task[], data: GenerateCmdContext) {
      if (data.passportPackage) {
        const packageJson = inject(ProjectPackageJson);
        const passportClient = inject(PassportClient);

        packageJson.addDependency(data.passportPackage, await passportClient.getPackageVersion(data.passportPackage));

        if (!packageJson.devDependencies["@types/passport"]) {
          packageJson.addDevDependency("@types/passport", "latest");
        }

        if (!packageJson.dependencies["passport"]) {
          packageJson.addDevDependency("passport", "latest");
        }
      }

      return tasks;
    }
  }
});
