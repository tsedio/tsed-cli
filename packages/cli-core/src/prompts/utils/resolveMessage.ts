import type {PromptQuestion} from "../interfaces/PromptQuestion.js";

export function resolveMessage(question: PromptQuestion, answers: Record<string, any>) {
  if (typeof question.message === "function") {
    return question.message(answers);
  }

  return question.message;
}
