import type {BaseCommandOptions, CommandArg, CommandOpts} from "./CommandOptions.js";

export interface CommandMetadata extends Omit<BaseCommandOptions<any>, "args" | "options" | "allowUnknownOption"> {
  enableFeatures: string[];
  disableReadUpPkg: boolean;
  bindLogger: boolean;

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
