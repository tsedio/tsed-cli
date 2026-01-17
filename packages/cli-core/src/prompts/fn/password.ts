import {note, password as clackPassword} from "@clack/prompts";

import type {PromptPasswordQuestion} from "../interfaces/PromptQuestion.js";
import {resolveMessage} from "../utils/resolveMessage.js";

export async function password(question: PromptPasswordQuestion, answers: Record<string, unknown>) {
  const message = await resolveMessage(question, answers);

  while (true) {
    const result = await clackPassword({
      message,
      mask: question.mask === false ? undefined : typeof question.mask === "string" ? question.mask : "•"
    });

    const value = this.ensureNotCancelled(result);
    const transformed = await this.applyTransforms(question, answers, value);
    const error = await this.getValidationError(question, answers, transformed);

    if (!error) {
      return transformed;
    }

    note(error, "Validation error");
  }
}
