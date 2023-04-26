import {Type} from "@tsed/core";

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

export interface CommandOptions {
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

export interface CommandParameters {
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
    [key: string]: CommandOptions;
  };

  allowUnknownOption?: boolean;

  enableFeatures?: string[];

  disableReadUpPkg?: boolean;

  [key: string]: any;
}
