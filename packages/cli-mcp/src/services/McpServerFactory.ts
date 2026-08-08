import {McpServer, type ResourceTemplate} from "@modelcontextprotocol/server";
import {constant, inject, injectable, injector, logger, type TokenProvider} from "@tsed/di";
import {
  MCP_PROVIDER_TYPES,
  mcpStdioServer,
  mcpStreamableServer,
  type PlatformMcpSettings,
  type PromptsSettings,
  type ResourceSettings,
  type ToolProps
} from "@tsed/platform-mcp/cli";

function collectTokens(type: string, configured: TokenProvider[] = []): TokenProvider[] {
  const tokens = new Set<TokenProvider>(configured);

  injector()
    .getMany(type)
    .forEach((provider) => tokens.add(provider.token));

  return [...tokens];
}

function createMcpServer() {
  const settings = constant<PlatformMcpSettings>("mcp", {}) || {};
  const name = settings.name || constant<string>("name") || "tsed-mcp";
  const version = settings.version || constant<string>("version") || "0.0.0";
  const {websiteUrl, description, title, icons} = settings;

  const server = new McpServer(
    {
      websiteUrl,
      description,
      icons,
      title,
      name,
      version
    },
    settings?.serverOptions
  );

  const toolTokens = collectTokens(MCP_PROVIDER_TYPES.TOOL, settings.tools);
  toolTokens.forEach((token) => {
    const definition = inject<ToolProps<any, any> & {handler: any}>(token);
    const {name, handler, ...opts} = definition;
    server.registerTool(name!, opts as any, handler as any);
  });

  const resourceTokens = collectTokens(MCP_PROVIDER_TYPES.RESOURCE, settings.resources);
  resourceTokens.forEach((token) => {
    const definition = inject<ResourceSettings & {uri?: string; template?: ResourceTemplate}>(token);
    const {name, handler, uri, template, ...opts} = definition;
    const resourceName = name || String(token);

    if (uri) {
      server.registerResource(resourceName, uri, opts, handler as any);
    } else {
      server.registerResource(resourceName, template as ResourceTemplate, opts, handler as any);
    }
  });

  const promptTokens = collectTokens(MCP_PROVIDER_TYPES.PROMPT, settings.prompts);
  promptTokens.forEach((token) => {
    const definition = inject<PromptsSettings>(token);
    const {name, handler, ...opts} = definition;
    server.registerPrompt(name || String(token), opts as any, handler as any);
  });

  return server;
}

export const MCP_SERVER = injectable(McpServer)
  .factory(() => {
    const defaultMode = constant<"streamable-http" | "stdio">("mcp.mode");
    const server = createMcpServer();

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
