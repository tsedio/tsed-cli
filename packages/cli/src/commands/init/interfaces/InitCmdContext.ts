import {CliDefaultOptions} from "@tsed/cli-core";

import {InitOptions} from "./InitOptions.js";

export interface InitCmdContext extends InitOptions, CliDefaultOptions, Record<string, any> {
  root: string;
  srcDir: string;
}
