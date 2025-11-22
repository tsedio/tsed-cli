import type {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";

export async function mcpStreamableServer(server: McpServer) {
  const {StreamableHTTPServerTransport} = await import("@modelcontextprotocol/sdk/server/streamableHttp.js");
  // @ts-ignore
  const {default: express} = await import("express");

  const app = express();
  app.use(express.json());

  app.post("/mcp", async (req: any, res: any) => {
    // Create a new transport for each request to prevent request ID collisions
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true
    });

    res.on("close", () => {
      transport.close();
    });

    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  });

  const port = parseInt(process.env.PORT || "3000");

  app
    .listen(port, () => {
      console.log(`Demo MCP Server running on http://localhost:${port}/mcp`);
    })
    .on("error", (error: any) => {
      console.error("Server error:", error);
      process.exit(1);
    });
}
