import type {InitCmdContext} from "@tsed/cli";
import {CliService, inject, OnExec, ProjectPackageJson} from "@tsed/cli-core";
import {Injectable} from "@tsed/di";
import {pascalCase} from "change-case";

function getDatabase(ctx: InitCmdContext) {
  return ctx.features.find((type) => type.includes("typeorm:"))?.split(":")[1] || "";
}

@Injectable()
export class TypeORMInitHook {
  protected cliService = inject(CliService);
  protected packageJson = inject(ProjectPackageJson);

  @OnExec("init")
  onExec(ctx: InitCmdContext) {
    this.addScripts();
    this.addDependencies(ctx);
    this.addDevDependencies(ctx);

    const database = getDatabase(ctx);

    if (!database) {
      return [];
    }

    return this.cliService.getTasks("generate", {
      ...ctx,
      type: "typeorm:dataSource",
      name: pascalCase(database),
      typeormDataSource: ctx.features.find((value) => value.startsWith("typeorm:"))
    });
  }

  addScripts() {
    this.packageJson.addScripts({
      typeorm: "typeorm-ts-node-commonjs"
    });
  }

  addDependencies(ctx: InitCmdContext) {
    this.packageJson.addDependencies({}, ctx);
  }

  addDevDependencies(ctx: InitCmdContext) {
    this.packageJson.addDevDependencies({}, ctx);
  }
}
