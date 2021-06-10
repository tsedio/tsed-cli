import {InitCmdContext} from "@tsed/cli";
import {CliService, Inject, OnExec, ProjectPackageJson} from "@tsed/cli-core";
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
        skip: () => !ctx.GH_TOKEN,
        task: () => this.cliPrisma.patchPrismaSchema()
      },
      {
        title: "Generate Prisma Service",
        skip: () => ctx.GH_TOKEN,
        task: () =>
          this.cliService.getTasks("generate", {
            type: "prisma.service",
            name: "Prisma"
          })
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
    this.packageJson.addDependencies({}, ctx);
  }

  addDevDependencies(ctx: InitCmdContext) {
    this.packageJson.addDevDependencies({}, ctx);
  }
}
