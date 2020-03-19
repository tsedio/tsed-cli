import {Module} from "@tsed/cli-core";
import {TslintInitHook} from "./hooks/TslintInitHook";

@Module({
  imports: [TslintInitHook]
})
export class CliPluginTslintModule {}
