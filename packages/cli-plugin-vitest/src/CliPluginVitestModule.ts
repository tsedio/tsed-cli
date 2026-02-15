// Import templates to register them with the DI container
import "./templates/index.js";

import {
  type AlterGenerateTasks,
  type AlterInitSubTasks,
  type AlterPackageJson,
  CliProjectService,
  type GenerateCmdContext,
  type InitCmdContext,
  render
} from "@tsed/cli";
import {ProjectPackageJson, type Task} from "@tsed/cli-core";
import {inject, injectable} from "@tsed/di";

export class CliPluginVitestModule implements AlterInitSubTasks, AlterPackageJson, AlterGenerateTasks {
  $alterPackageJson(packageJson: ProjectPackageJson, data: InitCmdContext) {
    if (data.vitest) {
      packageJson.addScripts({
        "test:unit": "cross-env NODE_ENV=test vitest run",
        "test:watch": "cross-env NODE_ENV=test vitest",
        "test:coverage": `cross-env NODE_ENV=test vitest run --coverage`
      });
      packageJson.addDevDependencies({
        vitest: "latest",
        "unplugin-swc": "latest",
        "@vitest/coverage-v8": "latest",
        "@swc/core": "latest"
      });
    }

    return packageJson;
  }

  $alterInitSubTasks(tasks: Task[], data: InitCmdContext) {
    return [
      ...tasks,
      {
        title: "Create vitest configuration",
        enabled: () => !!data.vitest,
        task: () =>
          render("vitest.config", {
            symbolName: "vitest.config"
          })
      }
    ];
  }

  $alterGenerateTasks(tasks: Task[], data: GenerateCmdContext): Task[] {
    const {symbolPath} = data;

    return [
      ...tasks,
      {
        title: `Generate ${data.type} spec file to '${symbolPath}.spec.ts'`,
        enabled() {
          return !(data.type === "server" || data.type.includes(":dataSource") || data.type.includes(":connection"));
        },
        task: () => {
          let specTemplateType = [data.type, data.templateType, "spec"].filter(Boolean).join(".");
          specTemplateType = inject(CliProjectService).templates.get(specTemplateType) ? specTemplateType : "generic.spec";

          return render(specTemplateType, {
            ...data,
            symbolPath: data.symbolPath + ".spec"
          });
        }
      },
      {
        title: `Generate ${data.type} integration file '${symbolPath}.integration.spec.ts'`,
        enabled() {
          return ["controller", "server"].includes(data.type);
        },
        task: () => {
          return render(data.type + ".integration", {
            ...data,
            symbolPath: data.symbolPath + ".integration.spec"
          });
        }
      }
    ];
  }
}

injectable(CliPluginVitestModule);
