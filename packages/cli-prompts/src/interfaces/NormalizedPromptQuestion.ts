import type {NormalizedChoice} from "../utils/normalizeChoices.js";
import type {PromptAutocompleteQuestion, PromptQuestion} from "./PromptQuestion.js";

export type NormalizedPromptQuestion = PromptQuestion & {
  message: string;
  choices?: NormalizedChoice[];
  source?: PromptAutocompleteQuestion["source"];
  default?: unknown;
  mask?: string | boolean;
};
