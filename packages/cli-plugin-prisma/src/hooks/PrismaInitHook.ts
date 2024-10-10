import type {InitCmdContext} from "@tsed/cli";
import {inject, OnExec, PackageManagersModule, ProjectPackageJson} from "@tsed/cli-core";
import {Injectable} from "@tsed/di";

import {CliPrisma} from "../services/CliPrisma.js";

@Injectable()
export class PrismaInitHook {
  protected cliPrisma = inject(CliPrisma);
  protected packageJson = inject(ProjectPackageJson);
  protected packageManagers = inject(PackageManagersModule);

  @OnExec("init")
  onExec(ctx: InitCmdContext) {
    this.addScripts();
    this.addDependencies(ctx);
    this.addDevDependencies(ctx);

    return [
      {
        title: "Generate Prisma schema",
        task: () => this.cliPrisma.init()
      },
      {
        title: "Add Ts.ED configuration to Prisma schema",
        task: () => this.cliPrisma.patchPrismaSchema()
      }
    ];
  }

  addScripts() {
    this.packageJson.addScripts({
      "prisma:migrate": "npx prisma migrate dev --name init",
      "prisma:generate": "npx prisma generate"
    });
  }

  addDependencies(ctx: InitCmdContext) {
    this.packageJson.addDependencies(
      {
        "@tsed/prisma": "latest",
        "@prisma/client": "latest"
      },
      ctx
    );
  }

  addDevDependencies(ctx: InitCmdContext) {
    this.packageJson.addDevDependencies(
      {
        prisma: "latest"
      },
      ctx
    );
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
