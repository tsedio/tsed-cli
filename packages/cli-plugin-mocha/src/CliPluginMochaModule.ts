import {Module} from "@tsed/cli-core";
import {MochaGenerateHook} from "./hooks/MochaGenerateHook";
import {MochaInitHook} from "./hooks/MochaInitHook";

@Module({
  imports: [MochaInitHook, MochaGenerateHook]
})
export class CliPluginMochaModule {}
