import {Module} from "@tsed/cli-core";

import {PrismaCmd} from "./commands/PrismaCmd.js";
import {PrismaInitHook} from "./hooks/PrismaInitHook.js";

@Module({
  imports: [PrismaInitHook, PrismaCmd]
})
export class CliPluginPrismaModule {}
