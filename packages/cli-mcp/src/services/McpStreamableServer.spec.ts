import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {describe, expect, it} from "vitest";

import {mcpStreamableServer} from "./McpStreamableServer.js";

describe("mcpStreamableServer", () => {
  it("should be a function", () => {
    expect(typeof mcpStreamableServer).toBe("function");
  });

  it("should accept a McpServer instance", () => {
    const mockServer = {} as McpServer;

    expect(() => mcpStreamableServer(mockServer)).not.toThrow();
  });
});
