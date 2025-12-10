import type {BaseCommandOptions, CommandArg, CommandOpts} from "./CommandOptions.js";

export interface CommandMetadata extends BaseCommandOptions<any> {
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

  enableFeatures: string[];

  disableReadUpPkg: boolean;

  bindLogger: boolean;
}
