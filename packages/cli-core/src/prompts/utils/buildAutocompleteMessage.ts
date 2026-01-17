export function buildAutocompleteMessage(message: string, keyword: string) {
  return keyword ? `${message} (filter: ${keyword})` : message;
}
