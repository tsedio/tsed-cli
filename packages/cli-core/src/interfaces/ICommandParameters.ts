import {Type} from "@tsed/core";

export interface ICommandArg {
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

export interface ICommandOptions {
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

export interface ICommandParameters {
  /**
   * name commands
   */
  name: string;
  /**
   * Command description
   */
  description: string;
  /**
   * Command arguments
   */
  args?: {
    [key: string]: ICommandArg;
  };
  /**
   * Command options
   */
  options?: {
    [key: string]: ICommandOptions;
  };

  [key: string]: any;
}
