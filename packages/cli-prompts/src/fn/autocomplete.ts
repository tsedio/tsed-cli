import {autocomplete as a} from "@clack/prompts";

import type {NormalizedPromptQuestion} from "../interfaces/NormalizedPromptQuestion.js";
import {normalizeChoices} from "../utils/normalizeChoices.js";

export async function autocomplete(question: NormalizedPromptQuestion, answers: Record<string, unknown>) {
  if (!(question.source || question.choices)) {
    throw new Error(`Question "${question.name}" must provide a source for autocomplete prompts.`);
  }

  const choices = question.choices ? question.choices : question.source ? normalizeChoices(await question.source(answers)) : [];

  return a({
    ...(question as any),
    options: choices!.map((choice) => ({
      label: choice.label,
      value: choice.value,
      hint: choice.hint
    }))
  });
}
