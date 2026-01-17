import {password as clackPassword} from "@clack/prompts";

import type {NormalizedPromptQuestion} from "../interfaces/NormalizedPromptQuestion.js";

export async function password(question: NormalizedPromptQuestion) {
  return clackPassword(question);
}
