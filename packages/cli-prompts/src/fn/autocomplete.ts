import {select, text} from "@clack/prompts";

import type {NormalizedPromptQuestion} from "../interfaces/NormalizedPromptQuestion.js";
import type {PromptAutocompleteQuestion} from "../interfaces/PromptQuestion.js";
import {ensureNotCancelled} from "../utils/ensureNotCancelled.js";
import {normalizeChoices} from "../utils/normalizeChoices.js";
import {CONTINUE, processPrompt} from "../utils/processPrompt.js";
import {resolveListDefault} from "../utils/resolveListDefault.js";

const SEARCH_ACTION = "__tsed_cli_search_again__";

export async function autocomplete(question: NormalizedPromptQuestion, answers: Record<string, unknown>) {
  if (!question.source) {
    throw new Error(`Question "${question.name}" must provide a source for autocomplete prompts.`);
  }

  let keyword = "";

  let choices = await resolveAutocompleteChoices(question.source, answers, keyword);

  async function display() {
    keyword = await promptKeyword(question.message, keyword, true);
    choices = await resolveAutocompleteChoices(question.source!, answers, keyword);
  }

  return processPrompt(question, answers, async () => {
    if (!choices.length) {
      await display();
      return CONTINUE;
    }

    const selection = await select({
      message: buildAutocompleteMessage(question.message, keyword),
      options: [
        ...choices.map((choice) => ({
          label: choice.label,
          value: choice.value,
          hint: choice.hint
        })),
        {
          label: "🔍 Search again",
          value: SEARCH_ACTION,
          hint: "Type another keyword"
        }
      ],
      initialValue: resolveListDefault(question, choices),
      maxItems: question.pageSize
    });

    if (selection === SEARCH_ACTION) {
      await display();
      return CONTINUE;
    }

    return selection;
  });
}

async function resolveAutocompleteChoices(source: PromptAutocompleteQuestion["source"], answers: Record<string, any>, keyword: string) {
  const items = await source!(answers, keyword);

  return normalizeChoices(items);
}

async function promptKeyword(message: string, keyword: string, emptyState: boolean) {
  const label = emptyState ? `${message} (no matches, type to search)` : `${message} (type to refine search)`;
  const result = await text({
    message: label,
    initialValue: keyword
  });

  return ensureNotCancelled(result).trim();
}

function buildAutocompleteMessage(message: string, keyword: string) {
  return keyword ? `${message} (filter: ${keyword})` : message;
}
