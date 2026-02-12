export function defineTool<Input = any, Output = any>(options: {
  name: string;
  inputSchema?: any;
  outputSchema?: any;
  handler(args: Input): Promise<{structuredContent?: Output}> | {structuredContent?: Output};
}): symbol;

export function defineResource(options: {
  name: string;
  uri: string;
  title?: string;
  description?: string;
  mimeType?: string;
  handler(): Promise<{contents: {uri: string; text: string}[]}> | {contents: {uri: string; text: string}[]};
}): symbol;

export function definePrompt(options: {
  name: string;
  title?: string;
  description?: string;
  argsSchema?: Record<string, any>;
  handler(args: Record<string, any>): Promise<any> | any;
}): symbol;

export const MCP_SERVER: {
  connect(mode?: "stdio" | "streamable-http"): Promise<void>;
};
