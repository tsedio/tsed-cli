import {select} from "@clack/prompts";

import type {NormalizedPromptQuestion} from "../interfaces/NormalizedPromptQuestion.js";
import {resolveListDefault} from "../utils/resolveListDefault.js";

export async function list(question: NormalizedPromptQuestion) {
  if (!question.choices?.length) {
    throw new Error(`Question "${question.name}" does not provide any choices`);
  }

  return select({
    ...question,
    options: question.choices!.map((choice) => ({
      label: choice.label,
      value: choice.value,
      hint: choice.hint
    })),
    initialValue: resolveListDefault(question, question.choices!)
  });
}
