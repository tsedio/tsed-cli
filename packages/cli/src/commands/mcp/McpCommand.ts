import {command} from "@tsed/cli-core";
import {mcpServerConnect} from "@tsed/platform-mcp/cli";
import {s} from "@tsed/schema";

import {waitForShutdown} from "./utils/waitForShutdown.js";

const McpSchema = s.object({
  http: s.boolean().default(false).description("Run MCP using HTTP server").opt("--http")
});

export const McpCommand = command({
  name: "mcp",
  description: "Run a MCP server",
  inputSchema: McpSchema,
  async handler(data) {
    const mode = data.http ? "streamable-http" : "stdio";

    await mcpServerConnect(mode);

    // the injector is destroyed when this handler resolves: stay pending while the server runs
    await waitForShutdown(mode);
  }
}).token();
