import {text} from "@clack/prompts";

import type {NormalizedPromptQuestion} from "../interfaces/NormalizedPromptQuestion.js";
import {processPrompt} from "../utils/processPrompt.js";

export async function input(question: NormalizedPromptQuestion, answers: Record<string, unknown>) {
  return processPrompt(question, answers, () =>
    text({
      message: question.message,
      initialValue: String(question.default ?? "")
    })
  );
}
