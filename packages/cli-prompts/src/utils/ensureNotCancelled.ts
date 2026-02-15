import {cancel as cancelPrompt, isCancel} from "@clack/prompts";

import {PromptCancelledError} from "../errors/PromptCancelledError.js";

export function ensureNotCancelled<T>(value: T | symbol): T {
  if (isCancel(value)) {
    cancelPrompt();
    throw new PromptCancelledError();
  }

  return value;
}
