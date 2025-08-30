import type {InitCmdContext} from "@tsed/cli";
import {inject, OnAdd, ProjectPackageJson} from "@tsed/cli-core";
import {injectable} from "@tsed/di";

import {PrismaCmd} from "./commands/PrismaCmd.js";
import {PrismaInitHook} from "./hooks/PrismaInitHook.js";

export class CliPluginPrismaModule {
  protected packageJson = inject(ProjectPackageJson);

  @OnAdd("@tsed/cli-plugin-prisma")
  onAdd(ctx: InitCmdContext) {
    this.addScripts();
    this.addDependencies(ctx);
    this.addDevDependencies(ctx);
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
}

injectable(CliPluginPrismaModule).imports([PrismaInitHook, PrismaCmd]);
