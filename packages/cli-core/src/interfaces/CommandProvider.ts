import Inquirer from "inquirer";
import {Tasks} from "./Tasks";

export type QuestionOptions<T = any> = Inquirer.QuestionCollection<T>;

export interface CommandProvider<Ctx = any> {
  /**
   * Run a function before the main prompt. Useful for pre-loading data from the file system
   * @param initialOptions
   */
  $beforePrompt?(initialOptions: Partial<Ctx>): Partial<Ctx>;

  /**
   * Hook to create the main prompt for the command
   * See https://github.com/enquirer/enquirer for more detail on question configuration.
   * @param initialOptions
   */
  $prompt?<T = any>(initialOptions: Partial<Ctx>): QuestionOptions<T> | Promise<QuestionOptions<T>>;

  /**
   * Hook to map options
   * @param ctx
   */
  $mapContext?(ctx: Partial<Ctx>): Ctx;

  /**
   * Run something before the exec hook
   * @param ctx
   */
  $beforeExec?(ctx: Ctx): Promise<any>;

  /**
   * Run a command
   * @param ctx
   */
  $exec(ctx: Ctx): Tasks | Promise<Tasks> | any | Promise<any>;

  /**
   * Run commands after the npm/yarn install
   * @param ctx
   */
  $postInstall?(ctx: Ctx): Tasks | Promise<Tasks> | any | Promise<any>;
}
