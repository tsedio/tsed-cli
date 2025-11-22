import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import {DITest, inject, injector, logger} from "@tsed/di";
import {beforeEach, describe, expect, it, vi} from "vitest";

import {MCP_SERVER} from "./McpServerFactory.js";
import {mcpStdioServer} from "./McpStdioServer.js";
import {mcpStreamableServer} from "./McpStreamableServer.js";

vi.mock("./McpStdioServer.js", () => ({
  mcpStdioServer: vi.fn().mockResolvedValue(undefined)
}));

vi.mock("./McpStreamableServer.js", () => ({
  mcpStreamableServer: vi.fn().mockResolvedValue(undefined)
}));

describe("McpServerFactory", () => {
  describe("MCP_SERVER factory", () => {
    beforeEach(() =>
      DITest.create({
        env: "test",
        name: "test-server",
        pkg: {
          version: "1.0.0"
        } as any
      })
    );
    afterEach(() => DITest.reset());
    it("should create an MCP server with correct configuration", () => {
      const result = injector().invoke(MCP_SERVER);

      expect(result).toBeDefined();
      expect(result.server).toBeInstanceOf(McpServer);
      expect(result.connect).toBeInstanceOf(Function);
    });

    it("should have a server property", () => {
      const result = injector().invoke(MCP_SERVER);

      expect(result.server).toBeDefined();
      expect(result.server).toBeInstanceOf(McpServer);
    });

    it("should have a connect method", () => {
      const result = injector().invoke(MCP_SERVER);

      expect(result.connect).toBeDefined();
      expect(typeof result.connect).toBe("function");
    });
  });

  describe("connect method", () => {
    describe("stdio", () => {
      beforeEach(() =>
        DITest.create({
          env: "test",
          name: "test-server",
          pkg: {
            version: "1.0.0"
          } as any
        })
      );
      afterEach(() => DITest.reset());
      it("should connect using stdio mode by default", async () => {
        injector().settings.set("mcp.mode", "stdio");

        const result = inject(MCP_SERVER);
        const loggerSpy = vi.spyOn(logger(), "info");

        await result.connect();

        expect(loggerSpy).toHaveBeenCalledWith({event: "MCP_SERVER_CONNECT"});
        expect(loggerSpy).toHaveBeenCalledWith({event: "MCP_SERVER_CONNECTED"});
        expect(mcpStdioServer).toHaveBeenCalledWith(result.server);
      });
      it("should log connection events", async () => {
        const result = injector().invoke(MCP_SERVER);
        const loggerSpy = vi.spyOn(logger(), "info");

        await result.connect();

        expect(loggerSpy).toHaveBeenCalledTimes(2);
        expect(loggerSpy).toHaveBeenNthCalledWith(1, {event: "MCP_SERVER_CONNECT"});
        expect(loggerSpy).toHaveBeenNthCalledWith(2, {event: "MCP_SERVER_CONNECTED"});
      });
    });
    describe("http", () => {
      beforeEach(() =>
        DITest.create({
          env: "test",
          name: "test-server",
          pkg: {
            version: "1.0.0"
          } as any,
          mcp: {
            mode: "streamable-http"
          }
        })
      );
      afterEach(() => DITest.reset());
      it("should connect using streamable-http mode when configured", async () => {
        const result = inject(MCP_SERVER);
        const loggerSpy = vi.spyOn(logger(), "info");

        await result.connect();

        expect(loggerSpy).toHaveBeenCalledWith({event: "MCP_SERVER_CONNECT"});
        expect(loggerSpy).toHaveBeenCalledWith({event: "MCP_SERVER_CONNECTED"});
        expect(mcpStreamableServer).toHaveBeenCalled();
      });
    });
  });
});
