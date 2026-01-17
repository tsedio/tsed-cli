import {confirm as c} from "@clack/prompts";
import {isBoolean} from "@tsed/core/utils/isBoolean.js";

import type {NormalizedPromptQuestion} from "../interfaces/NormalizedPromptQuestion.js";
import {processPrompt} from "../utils/processPrompt.js";

export async function confirm(question: NormalizedPromptQuestion, answers: Record<string, unknown>) {
  const initialValue = isBoolean(question.default) ? question.default : undefined;

  return processPrompt(question, answers, () =>
    c({
      message: question.message,
      initialValue
    })
  );
}
