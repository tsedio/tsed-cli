import {injectable} from "@tsed/di";

import {OxcInitHook} from "./hooks/OxcInitHook.js";

export class CliPluginOxcModule {}

injectable(CliPluginOxcModule).imports([OxcInitHook]);
