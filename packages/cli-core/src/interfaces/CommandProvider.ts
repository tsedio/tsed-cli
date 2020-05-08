import * as Inquirer from "inquirer";
import {Tasks} from "./Tasks";

export type QuestionOptions<T = any> = Inquirer.QuestionCollection<T>;

export interface CommandProvider {
  /**
   * Hook to create the main prompt for the command
   * See https://github.com/enquirer/enquirer for more detail on question configuration.
   * @param initialOptions
   */
  $prompt?<T = any>(initialOptions: any): QuestionOptions<T>;

  /**
   * Hook to map options
   * @param options
   */
  $mapContext?(options: any): any;

  /**
   * Run something before the exec hook
   * @param options
   */
  $beforeExec?(options: any): Promise<any>;

  /**
   * Run a command
   * @param options
   */
  $exec(options: any): Tasks | Promise<Tasks>;

  /**
   * Run commands after the npm/yarn install
   * @param options
   */
  $postInstall?(options: any): Tasks | Promise<Tasks>;
}
