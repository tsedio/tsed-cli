import {command} from "@tsed/cli-core";
import {MCP_SERVER} from "@tsed/cli-mcp";
import {inject} from "@tsed/di";

export const McpCommand = command({
  name: "mcp",
  description: "Run a MCP server",
  async handler() {
    await inject(MCP_SERVER).connect();
    return [];
  }
}).token();
