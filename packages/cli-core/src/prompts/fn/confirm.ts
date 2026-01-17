import {confirm as c, note} from "@clack/prompts";

import type {PromptConfirmQuestion} from "../interfaces/PromptQuestion.js";
import {applyTransforms} from "../utils/applyTransforms.js";
import {ensureNotCancelled} from "../utils/ensureNotCancelled.js";
import {getValidationError} from "../utils/getValidationError.js";

export async function confirm(question: PromptConfirmQuestion, answers: Record<string, unknown>) {
  const message = await this.resolveMessage(question, answers);

  while (true) {
    const result = await c({
      message,
      initialValue: typeof question.default === "boolean" ? question.default : undefined
    });

    const value = ensureNotCancelled(result);
    const transformed = await applyTransforms(question, answers, value);
    const error = await getValidationError(question, answers, transformed);

    if (!error) {
      return transformed;
    }

    note(error, "Validation error");
  }
}
