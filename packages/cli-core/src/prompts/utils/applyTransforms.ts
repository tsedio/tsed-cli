import type {PromptQuestion} from "../interfaces/PromptQuestion.js";

export async function applyTransforms(question: PromptQuestion, answers: Record<string, any>, value: unknown) {
  let next = value;

  if (question.transformer) {
    next = await question.transformer(next, answers, {isFinal: true});
  }

  if (question.filter) {
    next = await question.filter(next, answers);
  }

  return next;
}
