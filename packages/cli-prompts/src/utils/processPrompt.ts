import {note} from "@clack/prompts";

import type {PromptQuestion} from "../interfaces/PromptQuestion.js";
import {applyTransforms} from "./applyTransforms.js";
import {ensureNotCancelled} from "./ensureNotCancelled.js";
import {getValidationError} from "./getValidationError.js";

export const CONTINUE = Symbol.for("prompt:continue");
type PromptExecutor = () => Promise<unknown> | unknown;

export async function processPrompt(question: PromptQuestion, answers: Record<string, unknown>, cb: PromptExecutor) {
  while (true) {
    const result = await cb();

    if (result === CONTINUE) {
      continue;
    }

    const value = ensureNotCancelled(result);
    const transformed = await applyTransforms(question, answers, value);
    const error = await getValidationError(question, answers, transformed);

    if (!error) {
      return transformed;
    }

    note(error, "Validation error");
  }
}
