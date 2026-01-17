import {text} from "@clack/prompts";

import {ensureNotCancelled} from "./ensureNotCancelled.js";

export async function promptKeyword(message: string, keyword: string, emptyState: boolean) {
  const label = emptyState ? `${message} (no matches, type to search)` : `${message} (type to refine search)`;
  const result = await text({
    message: label,
    initialValue: keyword
  });

  return ensureNotCancelled(result).trim();
}
