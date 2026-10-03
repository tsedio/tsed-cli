/**
 * Keep the `mcp` command pending while the MCP server is running.
 *
 * The CLI destroys the injector as soon as a command handler resolves. An MCP server keeps answering requests after
 * the connection is established, so the handler must stay pending or every later tool call runs on an empty injector.
 *
 * - `stdio`: resolves when the client closes stdin.
 * - `streamable-http`: never resolves, the HTTP server lives until the process is stopped.
 */
export function waitForShutdown(mode: "stdio" | "streamable-http", stdin: NodeJS.ReadableStream = process.stdin): Promise<void> {
  return new Promise<void>((resolve) => {
    if (mode === "stdio") {
      stdin.once("end", resolve);
      stdin.once("close", resolve);
    }
  });
}
