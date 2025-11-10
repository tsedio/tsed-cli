import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {StdioServerTransport} from "@modelcontextprotocol/sdk/server/stdio.js";
import {constant, inject, injectable, type TokenProvider} from "@tsed/di";

import type {PromptProps} from "../fn/definePrompt.js";
import type {ResourceProps} from "../fn/defineResource.js";
import type {ToolProps} from "../fn/defineTool.js";

export const MCP_SERVER = injectable(McpServer)
  .factory(() => {
    const server = new McpServer({
      name: constant<string>("name")!,
      version: constant<string>("pkg.version")!
    });

    const tools = constant<TokenProvider[]>("tools", []);

    tools.map((token) => {
      const {name, handler, ...opts} = inject<ToolProps<any, any>>(token);
      server.registerTool(name, opts as any, handler);
    });

    const resources = constant<TokenProvider[]>("resources", []);

    resources.map((token) => {
      const {name, uri, template, handler, ...opts} = inject<ResourceProps>(token);

      server.registerResource(name, (uri || template) as any, opts, handler as any);
    });

    const prompts = constant<TokenProvider[]>("prompts", []);

    prompts.map((token) => {
      const {name, handler, ...opts} = inject<PromptProps>(token);

      server.registerPrompt(name, opts, handler as any);
    });

    return {
      server,
      connect() {
        const transport = new StdioServerTransport();
        return server.connect(transport);
      }
    };
  })
  .token();

export type MCP_SERVER = typeof MCP_SERVER;
