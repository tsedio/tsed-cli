import type {Answers, QuestionCollection} from "inquirer";

import type {Tasks} from "./Tasks.js";

export type QuestionOptions<T extends Answers = Answers> = QuestionCollection<T>;

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
  $prompt?<T extends Answers = Answers>(initialOptions: Partial<Ctx>): QuestionOptions<T> | Promise<QuestionOptions<T>>;

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

  $afterPostInstall?(ctx: Ctx): Tasks | Promise<Tasks> | any | Promise<any>;
}
