import {InitCmdContext} from "@tsed/cli";
import {CliService, createSubTasks, Inject, OnExec, ProjectPackageJson} from "@tsed/cli-core";
import {Injectable} from "@tsed/di";
import {CliPrisma} from "../services/CliPrisma";

@Injectable()
export class PrismaInitHook {
  @Inject()
  protected cliPrisma: CliPrisma;

  @Inject()
  protected cliService: CliService;

  @Inject()
  protected packageJson: ProjectPackageJson;

  @OnExec("init")
  async onExec(ctx: InitCmdContext) {
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
        enabled: () => !!ctx.GH_TOKEN,
        task: () => this.cliPrisma.patchPrismaSchema()
      },
      {
        title: "Generate Prisma Service",
        enabled: () => !ctx.GH_TOKEN,
        task: createSubTasks(
          async () =>
            await this.cliService.getTasks("generate", {
              ...ctx,
              type: "prisma.service",
              name: "Prisma"
            }),
          {...ctx, concurrent: false}
        )
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
    if (ctx.GH_TOKEN) {
      this.packageJson.addDependencies(
        {
          "@tsedio/prisma": "1.1.1"
        },
        ctx
      );
    }
    this.packageJson.addDependencies(
      {
        "@prisma/client": "latest"
      },
      ctx
    );
  }

  addDevDependencies(ctx: InitCmdContext) {
    this.packageJson.addDevDependencies({}, ctx);
  }
}
