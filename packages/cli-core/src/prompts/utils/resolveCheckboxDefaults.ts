import {isArray} from "@tsed/core/utils/isArray.js";

import type {PromptCheckboxQuestion} from "../interfaces/PromptQuestion.js";
import type {NormalizedChoice} from "./normalizeChoices.js";

export function resolveCheckboxDefaults(question: PromptCheckboxQuestion, choices: NormalizedChoice[]) {
  if (isArray(question.default)) {
    return question.default;
  }

  if (question.default !== undefined) {
    return [question.default];
  }

  const checkedValues = choices.filter((choice) => choice.checked).map((choice) => choice.value);

  return checkedValues.length ? checkedValues : [];
}
