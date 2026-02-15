import type {NormalizedChoice} from "../utils/normalizeChoices.js";
import type {PromptAutocompleteQuestion, PromptPasswordQuestion, PromptQuestion} from "./PromptQuestion.js";

export type NormalizedPromptQuestion = PromptQuestion & {
  message: string;
  choices?: NormalizedChoice[];
  source?: PromptAutocompleteQuestion["source"];
  mask?: PromptPasswordQuestion["mask"];
};
