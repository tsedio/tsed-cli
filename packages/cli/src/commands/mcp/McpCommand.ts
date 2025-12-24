import {command} from "@tsed/cli-core";
import {MCP_SERVER} from "@tsed/cli-mcp";
import {inject} from "@tsed/di";
import {s} from "@tsed/schema";

const McpSchema = s.object({
  http: s.boolean().default(false).description("Run MCP using HTTP server").opt("--http")
});

export const McpCommand = command({
  name: "mcp",
  description: "Run a MCP server",
  inputSchema: McpSchema,
  handler(data) {
    return inject(MCP_SERVER).connect(data.http ? "streamable-http" : "stdio");
  }
}).token();
