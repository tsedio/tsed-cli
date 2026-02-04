import type {PromptQuestion} from "../interfaces/PromptQuestion.js";

export async function shouldAsk(question: PromptQuestion, answers: Record<string, any>) {
  if (question.when === undefined) {
    return true;
  }

  if (typeof question.when === "function") {
    return !!(await question.when(answers));
  }

  return question.when;
}
