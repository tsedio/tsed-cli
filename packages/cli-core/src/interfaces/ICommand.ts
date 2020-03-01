import * as Inquirer from "inquirer";

export type QuestionOptions<T = any> = Inquirer.QuestionCollection<T>;

export interface ICommand {
  /**
   * Hook to create the main prompt for the command
   * See https://github.com/enquirer/enquirer for more detail on question configuration.
   * @param initialOptions
   */
  $prompt?<T = any>(initialOptions: any): QuestionOptions<T>;

  /**
   * Hook to add questions from other Services/Modules/Commands
   * See https://github.com/enquirer/enquirer for more detail on question configuration.
   * @param cmd
   * @param questions
   * @param initialOptions
   */
  $onPrompt?<T = any>(cmd: string, questions: QuestionOptions<T>, initialOptions: any): void;

  /**
   * Run a command
   * @param options
   */
  $exec(options: any): Promise<void>;
}
