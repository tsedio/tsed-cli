import "./interfaces/interfaces.js";

export * from "./services/McpServerFactory.js";
export {
  asResourceResponse,
  asToolResponse,
  definePrompt,
  defineResource,
  defineTool,
  fromJsonSchema,
  type PlatformMcpSettings,
  Prompt,
  type PromptsSettings,
  Resource,
  type ResourceSettings,
  Tool,
  type ToolProps
} from "@tsed/platform-mcp/common";
