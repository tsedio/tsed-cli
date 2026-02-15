export interface PromptQuestion {
  type: string;
  name: string;
  message: string;
  default?: unknown;
  validate?(value: string | undefined): string | undefined;
  when?(answers: Record<string, any>): boolean;
  choices?: unknown[];
  source?: (answers: Record<string, any>, keyword?: string) => Promise<unknown[]> | unknown[];
}
