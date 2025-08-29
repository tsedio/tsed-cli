import type {AlterInitSubTasks, InitCmdContext} from "@tsed/cli";
import {inject, PackageManagersModule, ProjectPackageJson, type Task} from "@tsed/cli-core";
import {injectable} from "@tsed/di";

import {CliPrisma} from "../services/CliPrisma.js";

export class PrismaInitHook implements AlterInitSubTasks {
  protected cliPrisma = inject(CliPrisma);
  protected packageJson = inject(ProjectPackageJson);
  protected packageManagers = inject(PackageManagersModule);

  $alterInitSubTasks(tasks: Task[], data: InitCmdContext): Task[] | Promise<Task[]> {
    return [
      ...tasks,
      {
        title: "Generate Prisma schema",
        enabled: () => !!data.prisma,
        task: () => this.cliPrisma.init()
      },
      {
        title: "Add Ts.ED configuration to Prisma schema",
        enabled: () => !!data.prisma,
        task: () => this.cliPrisma.patchPrismaSchema()
      }
    ];
  }

  $onFinish() {
    return new Promise((resolve) => {
      this.packageManagers.runScript("prisma:generate").subscribe({
        complete() {
          resolve([]);
        },
        error: () => {
          resolve([]);
        }
      });
    });
  }
}

injectable(PrismaInitHook);
