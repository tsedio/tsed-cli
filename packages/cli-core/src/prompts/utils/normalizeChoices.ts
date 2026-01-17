import type {PromptChoiceInput} from "../interfaces/PromptQuestion.js";

export type NormalizedChoice = {
  label: string;
  value: any;
  hint?: string;
  checked?: boolean;
};

export function normalizeChoices(inputs: PromptChoiceInput[] = []): NormalizedChoice[] {
  return inputs.map((choice) => {
    if (typeof choice === "object" && choice !== null && "value" in choice) {
      const resolvedValue = choice.value ?? choice.name;

      return {
        label: choice.name ?? String(resolvedValue ?? ""),
        value: resolvedValue,
        hint: choice.short,
        checked: choice.checked
      };
    }

    return {
      label: String(choice),
      value: choice
    };
  });
}
