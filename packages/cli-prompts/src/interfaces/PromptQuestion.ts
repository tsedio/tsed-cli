type MaybePromise<T> = T | Promise<T>;

/**
 * Enumerates the built-in prompt types supported by the Ts.ED CLI.
 */
export type PromptType = "input" | "password" | "confirm" | "list" | "checkbox" | "autocomplete";

/**
 * Represents a single choice entry usable by select, checkbox, and autocomplete prompts.
 */
export interface PromptChoice<Value = any> {
  /**
   * Human friendly label displayed in the prompt list.
   */
  name?: string;
  /**
   * Raw value returned when the choice is selected.
   */
  value?: Value;
  /**
   * Optional short label shown beside the main choice name.
   */
  short?: string;
  /**
   * Marks the choice as disabled (boolean or reason string).
   */
  disabled?: boolean | string;
  /**
   * For checkbox prompts, marks the choice as checked by default.
   */
  checked?: boolean;
}

/**
 * Choice definition accepted by prompts. A plain value will be coerced to a `PromptChoice`.
 */
export type PromptChoiceInput<Value = any> = PromptChoice<Value> | Value;

/**
 * Transforms user input before it becomes part of the command context.
 */
export type PromptTransformer = (input: any, answers: Record<string, any>, flags?: {isFinal?: boolean}) => any;

/**
 * Validates the user input, returning `true`, `false`, or an error string.
 */
export type PromptValidator = (input: any, answers: Record<string, any>) => MaybePromise<boolean | string>;

/**
 * Filters the answer into a different representation before persistence.
 */
export type PromptFilter = (input: any, answers: Record<string, any>) => MaybePromise<any>;

/**
 * Determines whether a prompt should run.
 */
export type PromptWhen = boolean | ((answers: Record<string, any>) => MaybePromise<boolean>);

/**
 * Base contract shared by every question type.
 */
export interface PromptBaseQuestion<Value = any> {
  /**
   * Prompt type to render.
   */
  type: PromptType;
  /**
   * Unique answer key assigned to the prompt.
   */
  name: string;
  /**
   * Prompt label. Accepts a string or function (resolved at runtime).
   */
  message: string | ((answers: Record<string, any>) => MaybePromise<string>);
  /**
   * Allows skipping the prompt based on previous answers.
   */
  when?: PromptWhen;
  /**
   * Default input value or factory function returning one.
   */
  default?: Value | ((answers: Record<string, any>) => MaybePromise<Value>);
  /**
   * Mutates the visual input while the user types.
   */
  transformer?: PromptTransformer;
  /**
   * Validates user input. Return `false`/string to display an error.
   */
  validate?: PromptValidator;
  /**
   * Mutates the stored answer after validation.
   */
  filter?: PromptFilter;
  /**
   * Optional max number of rows visible in select/checkbox prompts.
   */
  pageSize?: number;
  /**
   * Whether select prompts loop when reaching boundaries.
   */
  loop?: boolean;
}

/**
 * Plain text prompt.
 */
export interface PromptInputQuestion extends PromptBaseQuestion<string> {
  type: "input";
}

/**
 * Hidden text prompt (e.g., passwords or tokens).
 */
export interface PromptPasswordQuestion extends PromptBaseQuestion<string> {
  type: "password";
  /**
   * Character used to mask input (default: •). Set `false` to show raw input.
   */
  mask?: string | boolean;
}

/**
 * Boolean confirmation prompt (yes/no).
 */
export interface PromptConfirmQuestion extends PromptBaseQuestion<boolean> {
  type: "confirm";
}

/**
 * Single-select prompt with predefined choices.
 */
export interface PromptListQuestion extends PromptBaseQuestion<any> {
  type: "list";
  /**
   * Available choices displayed to the user.
   */
  choices: PromptChoiceInput[];
}

/**
 * Multi-select prompt where the result is an array of chosen values.
 */
export interface PromptCheckboxQuestion extends PromptBaseQuestion<any[]> {
  type: "checkbox";
  /**
   * Available choices displayed to the user.
   */
  choices: PromptChoiceInput[];
}

/**
 * Searchable prompt that fetches choices dynamically.
 */
export interface PromptAutocompleteQuestion extends PromptBaseQuestion<any> {
  type: "autocomplete";
  /**
   * Async loader returning the set of choices filtered by the keyword.
   */
  source: (answers: Record<string, any>, keyword?: string) => MaybePromise<PromptChoiceInput[]>;
}

/**
 * Union describing every supported Ts.ED CLI question type.
 */
export type PromptQuestion =
  | PromptInputQuestion
  | PromptPasswordQuestion
  | PromptConfirmQuestion
  | PromptListQuestion
  | PromptCheckboxQuestion
  | PromptAutocompleteQuestion;

/**
 * Allows providing a single question or an array of questions from `$prompt`.
 */
export type QuestionOptions = PromptQuestion | PromptQuestion[];
