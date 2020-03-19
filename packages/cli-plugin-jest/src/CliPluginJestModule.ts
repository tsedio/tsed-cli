import {Module} from "@tsed/cli-core";
import {JestGenerateHook} from "./hooks/JestGenerateHook";
import {JestInitHook} from "./hooks/JestInitHook";

@Module({
  imports: [JestInitHook, JestGenerateHook]
})
export class CliPluginJestModule {}
