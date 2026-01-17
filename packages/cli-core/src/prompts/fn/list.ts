import {note, select} from "@clack/prompts";

import type {PromptAutocompleteQuestion, PromptChoiceInput, PromptListQuestion} from "../interfaces/PromptQuestion.js";
import {applyTransforms} from "../utils/applyTransforms.js";
import {ensureNotCancelled} from "../utils/ensureNotCancelled.js";
import {getValidationError} from "../utils/getValidationError.js";
import {normalizeChoices} from "../utils/normalizeChoices.js";
import {resolveListDefault} from "../utils/resolveListDefault.js";
import {resolveMessage} from "../utils/resolveMessage.js";

export async function list(question: PromptListQuestion, answers: Record<string, unknown>) {
  const choices = normalizeChoices(question.choices);
  const message = await resolveMessage(question, answers);

  if (!choices.length) {
    throw new Error(`Question "${question.name}" does not provide any choices`);
  }

  while (true) {
    const result = await select({
      message,
      options: choices.map((choice) => ({
        label: choice.label,
        value: choice.value,
        hint: choice.hint
      })),
      initialValue: resolveListDefault(question, choices),
      maxItems: question.pageSize
    });

    const value = ensureNotCancelled(result);
    const transformed = await applyTransforms(question, answers, value);
    const error = await getValidationError(question, answers, transformed);

    if (!error) {
      return transformed;
    }

    note(error, "Validation error");
  }
}
