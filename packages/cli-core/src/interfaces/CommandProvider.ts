import type {PromptQuestion} from "@tsed/cli-prompts";
import type {MaybePromise, Task} from "@tsed/cli-tasks";

export interface CommandProvider<Ctx = any> {
  /**
   * Hook to create the main prompt for the command. Refer to {@link PromptQuestion}
   * for supported question attributes.
   * @param initialOptions
   */
  $prompt?(initialOptions: Partial<Ctx>): PromptQuestion[] | Promise<PromptQuestion[]>;

  /**
   * Hook to map options
   * @param ctx
   */
  $mapContext?(ctx: Partial<Ctx>): Ctx;

  /**
   * Run a command
   * @param ctx
   */
  $exec(ctx: Ctx): MaybePromise<Task<Ctx>[] | void>;

  /**
   * Run commands after the npm/yarn install
   * @param ctx
   */
  $postInstall?(ctx: Ctx): MaybePromise<Task<Ctx>[] | void>;

  $afterPostInstall?(ctx: Ctx): MaybePromise<Task<Ctx>[] | void>;
}
