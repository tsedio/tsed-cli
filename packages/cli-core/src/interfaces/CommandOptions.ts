import type {PromptQuestion} from "@tsed/cli-prompts";
import type {Tasks} from "@tsed/cli-tasks";
import {Type} from "@tsed/core";
import type {TokenProvider} from "@tsed/di";
import type {JsonSchema} from "@tsed/schema";

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

export interface BaseCommandOptions<Input> {
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

  inputSchema?: JsonSchema<Input> | (() => JsonSchema<Input>);

  /**
   * CommandProvider options
   */
  options?: {
    [key: string]: CommandOpts;
  };

  allowUnknownOption?: boolean;

  enableFeatures?: string[];

  disableReadUpPkg?: boolean;

  bindLogger?: boolean;
}

interface FunctionalCommandOptions<Input> extends BaseCommandOptions<Input> {
  handler: (data: Input) => Tasks | Promise<Tasks> | any | Promise<any>;

  prompt?(initialOptions: Partial<Input>): PromptQuestion[] | Promise<PromptQuestion[]>;

  [key: string]: any;
}

export interface ClassCommandOptions<Input> extends BaseCommandOptions<Input> {
  token: TokenProvider<CommandProvider>;

  [key: string]: any;
}

export type CommandOptions<Input> = ClassCommandOptions<Input> | FunctionalCommandOptions<Input>;
