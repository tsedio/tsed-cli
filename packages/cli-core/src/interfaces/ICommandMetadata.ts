import {ICommandArg, ICommandOptions} from "./ICommandParameters";

export interface ICommandMetadata {
  /**
   * name commands
   */
  name: string;

  alias?: string;
  /**
   * Command description
   */
  description: string;
  /**
   * Command arguments
   */
  args: {
    [key: string]: ICommandArg;
  };
  /**
   * Command options
   */
  options: {
    [key: string]: ICommandOptions;
  };

  allowUnknownOption?: boolean;
}
