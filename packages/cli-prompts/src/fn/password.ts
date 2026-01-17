import {password as clackPassword} from "@clack/prompts";

import type {NormalizedPromptQuestion} from "../interfaces/NormalizedPromptQuestion.js";
import {processPrompt} from "../utils/processPrompt.js";

export async function password(question: NormalizedPromptQuestion, answers: Record<string, unknown>) {
  return processPrompt(question, answers, () =>
    clackPassword({
      message: question.message,
      mask: question.mask === false ? undefined : String(question.mask || "•")
    })
  );
}
