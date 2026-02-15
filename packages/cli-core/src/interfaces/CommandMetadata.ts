import type {TasksOptions} from "@tsed/cli-tasks";

import type {BaseCommandOptions, CommandArg, CommandOpts} from "./CommandOptions.js";

export interface CommandMetadata extends Omit<BaseCommandOptions<any>, "args" | "options" | "allowUnknownOption"> {
  enableFeatures: string[];
  disableReadUpPkg: boolean;
  renderMode?: TasksOptions["renderMode"];

  getOptions(): {
    /**
     * CommandProvider arguments
     */
    args: {
      [key: string]: CommandArg;
    };
    /**
     * CommandProvider options
     */
    options: {
      [key: string]: CommandOpts;
    };

    allowUnknownOption?: boolean;
  };
}
