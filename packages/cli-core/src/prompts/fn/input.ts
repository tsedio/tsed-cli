import {note, text} from "@clack/prompts";

import type {PromptInputQuestion} from "../interfaces/PromptQuestion.js";

export async function input(question: PromptInputQuestion, answers: Record<string, unknown>) {
  let currentValue = (await this.resolveMaybe(question.default, answers)) ?? question.default ?? "";
  currentValue = currentValue ? String(currentValue) : "";
  const message = await this.resolveMessage(question, answers);

  while (true) {
    const result = await text({
      message,
      initialValue: currentValue
    });

    const value = this.ensureNotCancelled(result);
    const transformed = await this.applyTransforms(question, answers, value);
    const error = await this.getValidationError(question, answers, transformed);

    if (!error) {
      return transformed;
    }

    currentValue = value;
    note(error, "Validation error");
  }
}
