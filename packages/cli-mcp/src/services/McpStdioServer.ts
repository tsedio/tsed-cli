import type {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {logger} from "@tsed/di";

export async function mcpStdioServer(server: McpServer) {
  const {StdioServerTransport} = await import("@modelcontextprotocol/sdk/server/stdio.js");

  const transport = new StdioServerTransport();

  logger().stop();

  return server.connect(transport);
}
