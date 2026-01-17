import {note, select} from "@clack/prompts";

import type {PromptAutocompleteQuestion} from "../interfaces/PromptQuestion.js";
import {applyTransforms} from "../utils/applyTransforms.js";
import {buildAutocompleteMessage} from "../utils/buildAutocompleteMessage.js";
import {ensureNotCancelled} from "../utils/ensureNotCancelled.js";
import {getValidationError} from "../utils/getValidationError.js";
import {promptKeyword} from "../utils/promptKeyword.js";
import {resolveAutocompleteChoices} from "../utils/resolveAutocompleteChoices.js";
import {resolveListDefault} from "../utils/resolveListDefault.js";
import {resolveMessage} from "../utils/resolveMessage.js";

const SEARCH_ACTION = "__tsed_cli_search_again__";

export async function autocomplete(question: PromptAutocompleteQuestion, answers: Record<string, unknown>) {
  if (!question.source) {
    throw new Error(`Question "${question.name}" must provide a source for autocomplete prompts.`);
  }

  let keyword = "";
  const baseMessage = await resolveMessage(question, answers);
  let choices = await resolveAutocompleteChoices(question.source, answers, keyword);

  while (true) {
    if (!choices.length) {
      keyword = await promptKeyword(baseMessage, keyword, true);
      choices = await resolveAutocompleteChoices(question.source, answers, keyword);
      continue;
    }

    const selection = await select({
      message: buildAutocompleteMessage(baseMessage, keyword),
      options: [
        ...choices.map((choice) => ({
          label: choice.label,
          value: choice.value,
          hint: choice.hint
        })),
        {
          label: "🔍 Search again",
          value: SEARCH_ACTION,
          hint: "Type another keyword"
        }
      ],
      initialValue: resolveListDefault(question, choices),
      maxItems: question.pageSize
    });

    const value = ensureNotCancelled(selection);

    if (value === SEARCH_ACTION) {
      keyword = await promptKeyword(baseMessage, keyword, false);
      choices = await resolveAutocompleteChoices(question.source, answers, keyword);
      continue;
    }

    const transformed = await applyTransforms(question, answers, value);
    const error = await getValidationError(question, answers, transformed);

    if (!error) {
      return transformed;
    }

    note(error, "Validation error");
  }
}
