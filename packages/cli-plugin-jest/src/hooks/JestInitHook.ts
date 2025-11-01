import {type AlterInitSubTasks, type InitCmdContext, render} from "@tsed/cli";
import type {Task} from "@tsed/cli-core";
import {injectable} from "@tsed/di";

export class JestInitHook implements AlterInitSubTasks {
  $alterInitSubTasks(tasks: Task[], data: InitCmdContext) {
    return [
      ...tasks,
      {
        title: "Create jest configuration",
        enabled: () => !!data.jest,
        task: () => {
          render("jest.config", {
            symbolName: "jest.config"
          });
        }
      }
    ];
  }
}

injectable(JestInitHook);
