import type {PromptAutocompleteQuestion, PromptChoiceInput, PromptQuestion} from "./PromptQuestion.js";

export type NormalizedPromptQuestion = PromptQuestion & {
  message: string;
  choices?: PromptChoiceInput[];
  source?: PromptAutocompleteQuestion["source"];
};
