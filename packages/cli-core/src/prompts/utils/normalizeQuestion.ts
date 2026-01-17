import type {NormalizedPromptQuestion} from "../interfaces/NormalizedPromptQuestion.js";
import type {PromptQuestion} from "../interfaces/PromptQuestion.js";
import {resolveMaybe} from "./resolveMaybe.js";

export async function normalizeQuestion(question: PromptQuestion, answers: Record<string, unknown>) {
  const normalized: NormalizedPromptQuestion = {
    ...(question as any),
    name: question.name,
    type: question.type,
    message: await resolveMaybe<string>(question.message, answers)
  };

  if (question.default !== undefined) {
    normalized.default = await resolveMaybe(question.default, answers);
  }

  if ("choices" in question && question.choices) {
    normalized.choices = [...question.choices];
  }

  if (question.type === "autocomplete" && question.source) {
    const source = question.source;

    normalized.source = (state: Record<string, any>, keyword?: string) => {
      return source({...answers, ...state}, keyword);
    };
  }

  return normalized;
}
