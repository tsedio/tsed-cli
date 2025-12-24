import {Type} from "@tsed/core";
import type {TokenProvider} from "@tsed/di";
import type {JsonSchema} from "@tsed/schema";
import type {Answers} from "inquirer";

import type {CommandProvider, QuestionOptions} from "./CommandProvider.js";
import type {Tasks} from "./Tasks.js";

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
  prompt?<T extends Answers = Answers>(initialOptions: Partial<Input>): QuestionOptions<T> | Promise<QuestionOptions<T>>;
  handler: (data: Input) => Tasks | Promise<Tasks> | any | Promise<any>;

  [key: string]: any;
}

export interface ClassCommandOptions<Input> extends BaseCommandOptions<Input> {
  token: TokenProvider<CommandProvider>;

  [key: string]: any;
}

export type CommandOptions<Input> = ClassCommandOptions<Input> | FunctionalCommandOptions<Input>;
