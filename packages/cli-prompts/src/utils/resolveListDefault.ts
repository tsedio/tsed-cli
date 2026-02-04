import type {PromptAutocompleteQuestion, PromptListQuestion} from "../interfaces/PromptQuestion.js";
import type {NormalizedChoice} from "./normalizeChoices.js";

export function resolveListDefault(
  question: Pick<PromptListQuestion | PromptAutocompleteQuestion, "default">,
  choices: NormalizedChoice[]
) {
  if (question.default !== undefined) {
    if (typeof question.default === "number") {
      return choices[question.default]?.value ?? choices[0]?.value;
    }

    return question.default;
  }

  const checked = choices.find((choice) => choice.checked);
  if (checked) {
    return checked.value;
  }

  return choices[0]?.value;
}
