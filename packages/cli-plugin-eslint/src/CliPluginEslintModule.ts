import {injectable} from "@tsed/di";

import {EslintInitHook} from "./hooks/EslintInitHook.js";

export class CliPluginEslintModule {}

injectable(CliPluginEslintModule).imports([EslintInitHook]);
