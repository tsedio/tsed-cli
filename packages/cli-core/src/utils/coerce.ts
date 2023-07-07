export function coerce(value: any) {
  if (["undefined"].includes(value)) {
    return undefined;
  }
  if (["null"].includes(value)) {
    return null;
  }

  if (["false"].includes(value)) {
    return false;
  }

  if (["true"].includes(value)) {
    return true;
  }

  return value;
}
