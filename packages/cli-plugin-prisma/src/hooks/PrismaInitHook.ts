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
    this.packageJson.addDevDependencies({}, ctx);
  }
}
