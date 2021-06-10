import {Module, OnAdd, ProjectPackageJson} from "@tsed/cli-core";
import {Inject} from "@tsed/di";
import {PrismaCmd} from "./commands/PrismaCmd";
import {PrismaInitHook} from "./hooks/PrismaInitHook";

@Module({
  imports: [PrismaInitHook, PrismaCmd]
})
export class CliPluginPrismaModule {
  @Inject()
  packageJson: ProjectPackageJson;

  @OnAdd("@tsed/cli-plugin-prisma")
  install() {
    this.packageJson.addDependencies({
      "@tsedio/prisma": "1.1.1"
    });
  }
}
