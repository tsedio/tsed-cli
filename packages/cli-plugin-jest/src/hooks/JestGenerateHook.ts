import {type AlterGenerateTasks, CliProjectService, type GenerateCmdContext, render} from "@tsed/cli";
import {inject, type Task} from "@tsed/cli-core";
import {injectable} from "@tsed/di";

export class JestGenerateHook implements AlterGenerateTasks {
  protected projectService = inject(CliProjectService);

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
          specTemplateType = this.projectService.templates.get(specTemplateType) ? specTemplateType : "generic.spec";

          render(specTemplateType, {
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
          render(data.type + ".integration", {
            ...data,
            symbolPath: data.symbolPath + ".integration.spec"
          });
        }
      }
    ];
  }
}

injectable(JestGenerateHook);
