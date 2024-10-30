import {Module} from "@tsed/cli-core";

import {EslintInitHook} from "./hooks/EslintInitHook.js";

@Module({
  imports: [EslintInitHook]
})
export class CliPluginEslintModule {}
