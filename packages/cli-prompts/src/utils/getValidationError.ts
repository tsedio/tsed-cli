import {isString} from "@tsed/core";

import type {PromptQuestion} from "../interfaces/PromptQuestion.js";

export async function getValidationError(question: PromptQuestion, answers: Record<string, unknown>, value: unknown) {
  if (!question.validate) {
    return undefined;
  }

  const result = await question.validate(value, answers);

  if (result === false) {
    return "Invalid value.";
  }

  if (isString(result)) {
    return result;
  }

  return undefined;
}
