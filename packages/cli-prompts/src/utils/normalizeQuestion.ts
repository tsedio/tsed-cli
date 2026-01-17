import type {NormalizedPromptQuestion} from "../interfaces/NormalizedPromptQuestion.js";
import type {PromptQuestion} from "../interfaces/PromptQuestion.js";
import {normalizeChoices} from "./normalizeChoices.js";
import {resolveMaybe} from "./resolveMaybe.js";

export async function normalizeQuestion(question: PromptQuestion, answers: Record<string, unknown>) {
  const normalized: NormalizedPromptQuestion = {
    ...(question as any),
    name: question.name,
    type: question.type,
    message: await resolveMaybe(question.message, answers)
  };

  if ("default" in question && question.default !== undefined) {
    normalized.default = await resolveMaybe(question.default, answers);
  }

  if ("choices" in question && question.choices?.length) {
    normalized.choices = normalizeChoices([...question.choices]);
  }

  if ("source" in question && question.source) {
    const source = question.source;

    normalized.source = (state: Record<string, any>, keyword?: string) => {
      return source({...answers, ...state}, keyword);
    };
  }

  return normalized;
}
