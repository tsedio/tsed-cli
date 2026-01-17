import {multiselect, note} from "@clack/prompts";

import type {PromptCheckboxQuestion} from "../interfaces/PromptQuestion.js";
import {applyTransforms} from "../utils/applyTransforms.js";
import {ensureNotCancelled} from "../utils/ensureNotCancelled.js";
import {getValidationError} from "../utils/getValidationError.js";
import {normalizeChoices} from "../utils/normalizeChoices.js";
import {resolveCheckboxDefaults} from "../utils/resolveCheckboxDefaults.js";
import {resolveMessage} from "../utils/resolveMessage.js";

export async function checkbox(question: PromptCheckboxQuestion, answers: Record<string, unknown>) {
  const choices = normalizeChoices(question.choices);

  if (!choices.length) {
    throw new Error(`Question "${question.name}" does not provide any choices`);
  }

  const initialValues = resolveCheckboxDefaults(question, choices);
  const message = await resolveMessage(question, answers);

  while (true) {
    const result = await multiselect({
      message,
      options: choices.map((choice) => ({
        label: choice.label,
        value: choice.value,
        hint: choice.hint
      })),
      initialValues
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
