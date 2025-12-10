import {Type} from "@tsed/core";
import type {TokenProvider} from "@tsed/di";

import type {CommandProvider} from "./CommandProvider.js";

export interface CommandArg {
  /**
   * Description of the argument
   */
  description: string;
  /**
   * Use type to parse the option (String, Number, Boolean, Array)
   */
  type?: Type<any>;
  /**
   * Use item type to parse items
   */
  itemType?: Type<any>;
  /**
   * Default value
   */
  defaultValue?: string | number | boolean | any;
  /**
   * Define a require option
   */
  required?: boolean;
}

export interface CommandOpts {
  /**
   * Description of the commander.option()
   */
  description: string;
  /**
   * Use type to parse the option (String, Number, Boolean, Array)
   */
  type?: Type<any>;
  /**
   * Use item type to parse items
   */
  itemType?: Type<any>;
  /**
   * Default value
   */
  defaultValue?: string | number | boolean | any;
  /**
   * Define a require option
   */
  required?: boolean;
  /**
   * Use a custom Parser
   * @param value
   */
  customParser?: (value: any) => any;
}

export interface BaseCommandOptions {
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
  args?: {
    [key: string]: CommandArg;
  };
  /**
   * CommandProvider options
   */
  options?: {
    [key: string]: CommandOpts;
  };

  allowUnknownOption?: boolean;

  enableFeatures?: string[];

  disableReadUpPkg?: boolean;
}

interface FunctionalCommandOptions extends BaseCommandOptions {
  prompt?: CommandProvider["$prompt"];
  handler: CommandProvider["$exec"];

  [key: string]: any;
}

interface ClassCommandOptions extends BaseCommandOptions {
  token: TokenProvider<CommandProvider>;

  [key: string]: any;
}

export type CommandOptions = ClassCommandOptions | FunctionalCommandOptions;
