import {CommandArg, CommandOptions} from "./CommandParameters";

export interface CommandMetadata {
  /**
   * name commands
   */
  name: string;

  alias?: string;
  /**
   * CommandProvider description
   */
  description: string;
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
    [key: string]: CommandOptions;
  };

  allowUnknownOption?: boolean;
}
