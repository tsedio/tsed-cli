---
title: MCP servers with Ts.ED CLI
description: Use @tsed/cli-mcp to expose CLI features through the Model Context Protocol.
---

# Build MCP servers

`@tsed/cli-mcp` lets you expose any Ts.ED CLI command as a Model Context Protocol (MCP) server. MCP-aware clients (Claude Desktop, VS Code Agents, Cursor, etc.) can then invoke your generators without shell access.

## Installation

Add the MCP package anywhere you build CLI commands or standalone servers:

```bash
npm install @tsed/cli-mcp @modelcontextprotocol/sdk
```

The package has no global side effects. You opt-in by bootstrapping a server or by importing the helpers in your own CLI binary.

## Define tools, resources, and prompts

The helpers `defineTool`, `defineResource`, and `definePrompt` mirror the standard MCP concepts while keeping Ts.ED DI available inside handlers. The example below registers a tool, exposes a resource, wires a prompt, and then boots the MCP server:

<<< @/examples/cli/mcp-server.ts

Key points:

- Every handler runs in a `CliDIContext`, so you can inject services (`inject(SomeService)`) without manual wiring.
- `inputSchema` and `outputSchema` accept either `@tsed/schema` builders or raw Zod schemas. We automatically convert JsonSchema to Zod at runtime.
- `MCP_SERVER` is an injectable token that wires tools/resources/prompts registered via `define*` helpers and exposes a `connect()` method for stdio or HTTP transports.

## Wiring transports and authentication

The CLI injects the `MCP_SERVER` token, which exposes `connect(mode)` to start stdio or HTTP transports:

```ts
import {inject} from "@tsed/di";
import {MCP_SERVER} from "@tsed/cli-mcp";

await inject(MCP_SERVER).connect("stdio"); // or "streamable-http"
```

Use the HTTP/SSE/WS transports when you need to host an MCP server remotely. Always guard these endpoints:

- **Authentication:** Require a token or mTLS client certificate before allowing MCP connections.
- **Sandboxing:** Tools can execute generators, shell commands, or filesystem writes. Keep the MCP server inside a locked-down container when exposing it outside localhost.
- **Rate limiting:** Wrap handlers with Ts.ED interceptors that throttle high-risk calls (e.g., file generation, database migrations).

## Integrating with the CLI binary

If you want to ship an MCP server with your CLI distribution, add an entrypoint (for example via `command({name: "dev:mcp"})`) that calls `inject(MCP_SERVER).connect(...)`, or rely on the bundled `tsed-mcp` binary shipped with `@tsed/cli`.

```bash
npx tsed-mcp
```

The CLI resolves installed plugins, loads their MCP tools, and starts stdio transport automatically. To make your custom tools available:

1. Export them from your plugin/package.
2. Ensure the plugin is listed in the consumer's `package.json`.
3. Document the MCP URL (`stdio` or custom transport) so AI clients can point directly to it.
