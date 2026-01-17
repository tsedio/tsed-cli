import {select} from "@clack/prompts";

import type {NormalizedPromptQuestion} from "../interfaces/NormalizedPromptQuestion.js";
import {processPrompt} from "../utils/processPrompt.js";
import {resolveListDefault} from "../utils/resolveListDefault.js";

export async function list(question: NormalizedPromptQuestion, answers: Record<string, unknown>) {
  if (!question.choices?.length) {
    throw new Error(`Question "${question.name}" does not provide any choices`);
  }

  return processPrompt(question, answers, () =>
    select({
      message: question.message,
      options: question.choices!.map((choice) => ({
        label: choice.label,
        value: choice.value,
        hint: choice.hint
      })),
      initialValue: resolveListDefault(question, question.choices!),
      maxItems: question.pageSize
    })
  );
}
