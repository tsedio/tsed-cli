import {Module, ProjectPackageJson} from "@tsed/cli-core";
import {Inject} from "@tsed/di";

import {PrismaCmd} from "./commands/PrismaCmd.js";
import {PrismaInitHook} from "./hooks/PrismaInitHook.js";

@Module({
  imports: [PrismaInitHook, PrismaCmd]
})
export class CliPluginPrismaModule {
  @Inject()
  packageJson: ProjectPackageJson;
}
