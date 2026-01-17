import {text} from "@clack/prompts";

import type {NormalizedPromptQuestion} from "../interfaces/NormalizedPromptQuestion.js";

export async function input(question: NormalizedPromptQuestion) {
  return text({
    ...question,
    initialValue: String(question.default ?? "")
  });
}
