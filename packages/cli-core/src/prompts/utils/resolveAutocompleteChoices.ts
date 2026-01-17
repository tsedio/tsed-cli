import type {PromptAutocompleteQuestion} from "../interfaces/PromptQuestion.js";
import {normalizeChoices} from "./normalizeChoices.js";

export async function resolveAutocompleteChoices(
  source: PromptAutocompleteQuestion["source"],
  answers: Record<string, any>,
  keyword: string
) {
  const items = await source!(answers, keyword);

  return normalizeChoices(items);
}
