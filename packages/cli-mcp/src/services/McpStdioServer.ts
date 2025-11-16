import type {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";

export async function mcpStdioServer(server: McpServer) {
  const {StdioServerTransport} = await import("@modelcontextprotocol/sdk/server/stdio.js");

  const transport = new StdioServerTransport();

  return server.connect(transport);
}
