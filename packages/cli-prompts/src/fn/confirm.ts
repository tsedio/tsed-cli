import {confirm as c} from "@clack/prompts";
import {isBoolean} from "@tsed/core/utils/isBoolean.js";

import type {NormalizedPromptQuestion} from "../interfaces/NormalizedPromptQuestion.js";

export async function confirm(question: NormalizedPromptQuestion) {
  return c({
    ...question,
    initialValue: isBoolean(question.default) ? question.default : undefined
  });
}
