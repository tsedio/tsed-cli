import "inquirer-autocomplete-prompt";

import type {Answers, QuestionCollection} from "inquirer";
import AutocompletePrompt from "inquirer-autocomplete-prompt";

import type {Tasks} from "./Tasks.js";

declare module "inquirer" {
  export interface QuestionMap<T extends Answers = Answers> {
    autocomplete: AutocompletePrompt.AutocompleteQuestionOptions<T>;
  }
}

export type QuestionOptions<T extends Answers = Answers> = QuestionCollection<T>;

export interface CommandProvider<Ctx = any> {
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
