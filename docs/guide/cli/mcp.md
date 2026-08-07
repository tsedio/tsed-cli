---
title: MCP servers with Ts.ED CLI
description: Use @tsed/platform-mcp/cli to expose CLI features through the Model Context Protocol.
---

# Build MCP servers

`@tsed/platform-mcp/cli` lets you expose any Ts.ED CLI command as a Model Context Protocol (MCP) server. MCP-aware clients (Claude Desktop, VS Code Agents, Cursor, etc.) can then invoke your generators without shell access.

## Installation

Add the MCP package anywhere you build CLI commands or standalone servers:

::: code-group

```bash [npm]
npm install @tsed/platform-mcp
```

```bash [yarn]
yarn add @tsed/platform-mcp
```

```bash [pnpm]
pnpm add @tsed/platform-mcp
```

```bash [bun]
bun add @tsed/platform-mcp
```

:::

The package has no global side effects. You opt-in by bootstrapping a server or by importing the helpers in your own CLI binary.

## Define tools

Use @@defineTool@@ (functional) or @@Tool@@ (decorator) to register MCP tools with the Ts.ED DI container. Each handler still executes inside the CLI’s DI context, so you can reuse existing services, and the request/response shapes follow the [MCP protocol](https://modelcontextprotocol.io).

::: code-group

<<< @/examples/cli/mcp-tool-decorators.ts [Decorators]
<<< @/examples/cli/mcp-tool-functional.ts [Functional API]

:::

## Define resources

Expose immutable documents or live data streams by registering MCP resources through @@defineResource@@ or @@Resource@@. These helpers wrap MCP response models, so you only need to return the `contents` array.

::: code-group

<<< @/examples/cli/mcp-resource-decorators.ts [Decorators]
<<< @/examples/cli/mcp-resource-functional.ts [Functional API]

:::

## Define prompts

@@definePrompt@@ and @@Prompt@@ let you publish reusable prompt templates that MCP clients can fill before invoking your CLI. Describe the arguments with `@tsed/schema` builders— they are converted automatically into the schema format expected by MCP clients.

::: code-group

<<< @/examples/cli/mcp-prompt-decorators.ts [Decorators]
<<< @/examples/cli/mcp-prompt-functional.ts [Functional API]

:::

## Wiring transports and authentication

Call @@mcpServerConnect@@ after the CLI bootstrap has initialized the Ts.ED injector to start the shared MCP server with stdio or Streamable HTTP:

```ts
import {mcpServerConnect} from "@tsed/platform-mcp/cli";

await mcpServerConnect("stdio"); // or "streamable-http"
```

The `streamable-http` transport exposes `POST /mcp` on `process.env.PORT` (default: `3000`). Always guard that endpoint:

- **Authentication:** Require a token or mTLS client certificate before allowing MCP connections.
- **Sandboxing:** Tools can execute generators, shell commands, or filesystem writes. Keep the MCP server inside a locked-down container when exposing it outside localhost.
- **Rate limiting:** Wrap handlers with Ts.ED interceptors that throttle high-risk calls (e.g., file generation, database migrations).

## Integrating with the CLI binary

If you want to ship an MCP server with your CLI distribution, add an entrypoint (for example via @@command@@) that calls `mcpServerConnect()`. You can stick with decorators or the functional helper:

::: code-group

```ts [Decorators]
import {Command, type CommandProvider} from "@tsed/cli-core";
import {mcpServerConnect} from "@tsed/platform-mcp/cli";
import {s} from "@tsed/schema";

const McpSchema = s.object({
  http: s.boolean().default(false).description("Run MCP using HTTP server").opt("--http")
});

@Command({
  name: "mcp",
  description: "Run a MCP server",
  inputSchema: McpSchema
})
export class McpCommand implements CommandProvider<{http: boolean}> {
  async $exec({http}: {http: boolean}) {
    return mcpServerConnect(http ? "streamable-http" : "stdio");
  }
}
```

```ts [Functional API]
import {command} from "@tsed/cli-core";
import {mcpServerConnect} from "@tsed/platform-mcp/cli";
import {s} from "@tsed/schema";

const McpSchema = s.object({
  http: s.boolean().default(false).description("Run MCP using HTTP server").opt("--http")
});

export const McpCommand = command({
  name: "mcp",
  description: "Run a MCP server",
  inputSchema: McpSchema,
  handler({http}) {
    return mcpServerConnect(http ? "streamable-http" : "stdio");
  }
}).token();
```

:::

Publish the command the same way you register other CLI commands, then launch it through Node + SWC:

```bash
node --import @swc-node/register/esm-register src/bin/index.ts mcp --http
```

Want to smoke-test your tools, prompts, and resources without wiring a full client?
Run the MCP Inspector locally so you can call everything interactively:

```bash
npx @modelcontextprotocol/inspector node -e NODE_ENV=development --import @swc-node/register/esm-register bin/dev.ts mcp
```
