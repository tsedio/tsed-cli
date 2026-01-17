import {multiselect} from "@clack/prompts";
import {isArray} from "@tsed/core/utils/isArray.js";

import type {NormalizedPromptQuestion} from "../interfaces/NormalizedPromptQuestion.js";
import type {NormalizedChoice} from "../utils/normalizeChoices.js";
import {processPrompt} from "../utils/processPrompt.js";

export async function checkbox(question: NormalizedPromptQuestion, answers: Record<string, unknown>) {
  if (!question.choices?.length) {
    throw new Error(`Question "${question.name}" does not provide any choices`);
  }

  const initialValues = resolveCheckboxDefaults(question, question.choices);

  return processPrompt(question, answers, () =>
    multiselect({
      message: question.message,
      options: question.choices!.map((choice) => ({
        label: choice.label,
        value: choice.value,
        hint: choice.hint
      })),
      initialValues
    })
  );
}

function resolveCheckboxDefaults(question: NormalizedPromptQuestion, choices: NormalizedChoice[]) {
  if (isArray(question.default)) {
    return question.default;
  }

  if (question.default !== undefined) {
    return [question.default];
  }

  const checkedValues = choices.filter((choice) => choice.checked).map((choice) => choice.value);

  return checkedValues.length ? checkedValues : [];
}
