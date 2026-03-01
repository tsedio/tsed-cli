import {type CliCommandHooks, ProjectClient, type RenderDataContext} from "@tsed/cli";
import {type CliDatabases, CliService, inject, ProjectPackageJson, type Task} from "@tsed/cli-core";
import {injectable} from "@tsed/di";
import {pascalCase} from "change-case";

function getDatabase(ctx: RenderDataContext): CliDatabases | undefined {
  return ctx.features?.find((type) => type.includes("orm:typeorm:"))?.split(":")[2] as CliDatabases;
}

export class TypeORMInitHook implements CliCommandHooks {
  protected cliService = inject(CliService);

  $alterPackageJson(packageJson: ProjectPackageJson, data: RenderDataContext) {
    if (data.typeorm) {
      packageJson.addScripts({
        typeorm: "typeorm-ts-node-commonjs"
      });
    }

    return packageJson;
  }

  async $alterInitSubTasks(tasks: Task[], data: RenderDataContext) {
    const database = getDatabase(data);

    if (!database || !data.typeorm) {
      return tasks;
    }

    const typeormDataSource = data.features?.find((value) => value.startsWith("orm:typeorm:"));

    return [
      ...tasks,
      ...(await this.cliService.getTasks("generate", {
        ...data,
        type: "typeorm:dataSource",
        name: pascalCase(database),
        typeormDataSource
      }))
    ];
  }
}

injectable(TypeORMInitHook);
