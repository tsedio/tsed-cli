export function resolveMaybe<T>(
  value: T | ((answers: Record<string, any>) => T | Promise<T>) | undefined,
  answers: Record<string, any>
): Promise<T> | T {
  if (typeof value === "function") {
    return (value as any)(answers) as Promise<T> | T;
  }

  return value as T;
}
