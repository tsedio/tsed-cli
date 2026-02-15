import type {ResourceTemplate} from "@modelcontextprotocol/sdk/server/mcp.js";
import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {constant, inject, injectable, injector, logger, type TokenProvider} from "@tsed/di";

import {MCP_PROVIDER_TYPES} from "../constants/constants.js";
import type {PromptsSettings} from "../fn/definePrompt.js";
import type {ResourceProps} from "../fn/defineResource.js";
import type {ToolProps} from "../fn/defineTool.js";
import {mcpStdioServer} from "./McpStdioServer.js";
import {mcpStreamableServer} from "./McpStreamableServer.js";

function collectTokens(type: string, configured: TokenProvider[] = []): TokenProvider[] {
  const tokens = new Set<TokenProvider>(configured);

  injector()
    .getProviders(type)
    .forEach((provider) => tokens.add(provider.token));

  return [...tokens];
}

export const MCP_SERVER = injectable(McpServer)
  .factory(() => {
    const defaultMode = constant<"streamable-http" | "stdio">("mcp.mode");
    const name = constant<string>("name", "tsed-mcp");
    const version = constant<string>("version", "0.0.0");

    const server = new McpServer({
      name,
      version
    });

    const toolTokens = collectTokens(MCP_PROVIDER_TYPES.TOOL, constant<TokenProvider[]>("tools", []));

    toolTokens.forEach((token) => {
      const definition = inject<ToolProps<any, any> & {handler: any}>(token);
      const {name, handler, ...opts} = definition;
      server.registerTool(name!, opts as any, handler as any);
    });

    const resourceTokens = collectTokens(MCP_PROVIDER_TYPES.RESOURCE, constant<TokenProvider[]>("resources", []));

    resourceTokens.forEach((token) => {
      const definition = inject<ResourceProps & {uri?: string; template?: ResourceTemplate}>(token);
      const {name, handler, uri, template, ...opts} = definition;
      server.registerResource(name, (uri || template)! as any, opts, handler as any);
    });

    const promptTokens = collectTokens(MCP_PROVIDER_TYPES.PROMPT, constant<TokenProvider[]>("prompts", []));

    promptTokens.forEach((token) => {
      const definition = inject<PromptsSettings>(token);
      const {name, handler, ...opts} = definition;
      server.registerPrompt(name, opts, handler as any);
    });

    return {
      server,
      async connect(mode: "streamable-http" | "stdio" | undefined = defaultMode) {
        if (mode === "streamable-http") {
          logger().info({event: "MCP_SERVER_CONNECT", mode});

          await mcpStreamableServer(server);
        } else {
          await mcpStdioServer(server);
        }
      }
    };
  })
  .token();

export type MCP_SERVER = typeof MCP_SERVER;
