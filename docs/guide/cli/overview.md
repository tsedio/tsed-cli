---
title: CLI Overview
description: Understand how @tsed/cli-core, prompts, tasks, and MCP servers compose to build interactive developer tooling.
---

# CLI Overview

The Ts.ED CLI is no longer only a project scaffolder. The current runtime layers `@tsed/cli-core` with three specialized packages:

- `@tsed/cli-prompts` to orchestrate conversational flows with the Ts.ED DI container.
- `@tsed/cli-tasks` to stream progress, logs, and nested steps inside the terminal.
- `@tsed/cli-mcp` to expose any CLI capability through the Model Context Protocol (MCP) so AI assistants can call it.

This page shows how the pieces fit together, which versions you need, and how to bootstrap an interactive workflow.

## Architecture at a glance

1. **`@tsed/cli-core`** bootstraps the DI container, loads installed plugins, and resolves commands/tasks/prompts via decorators.
2. **`@tsed/cli-prompts`** declares reusable prompt providers. Each prompt receives the DI context, so you can reuse services or share state across steps.
3. **`@tsed/cli-tasks`** runs ordered task arrays and injects a `TaskLogger` into each step so you can stream progress, logs, and status updates to the terminal.
4. **`@tsed/cli-mcp`** wraps the same DI container in an MCP server. External clients (Claude Desktop, VS Code Agents, etc.) can call CLI tools through the MCP spec without shell access.

The runtime ensures tasks and prompts always run inside a `DIContext`, so your generators, plugins, and MCP tools share the exact same services.

## Compatibility matrix

| Package             | Minimum version | Node.js recommendation | Notes                                                                                                  |
| ------------------- | --------------- | ---------------------- | ------------------------------------------------------------------------------------------------------ |
| `@tsed/cli-core`    | `7.0.0`         | 3+                     | Base runtime for custom CLIs and plugins.                                                              |
| `@tsed/cli-prompts` | `7.0.0`         | 3+                     | Depends on `@tsed/di` and `@clack/prompts`.                                                            |
| `@tsed/cli-tasks`   | `7.0.0`         | 3+                     | Uses WHATWG streams for log forwarding.                                                                |
| `@tsed/cli-mcp`     | `7.0.0`         | 20+ recommended        | MCP transports lean on `@modelcontextprotocol/sdk` features that benefit from the Node 20 fetch stack. |

::: tip
The CLI binaries still support Node 16, but interactive prompts/tasks rely on `Intl` APIs that work best on Node 18+. Running on Node 20 ensures the bundled MCP server can reuse `fetch` without polyfills.
:::

`@tsed/cli-core` provides a bunch of reusable Ts.ED injectable services to handle differents usecases:

<ApiList query="symbolType.includes('class') && module === '@tsed/cli-core'" />

## Quickstart

1. Install the runtime packages inside any Node.js project. Include `@tsed/cli-mcp` only if you plan to expose commands over MCP:

::: code-group

```bash [npm]
npm install @tsed/cli-core @tsed/cli-prompts @tsed/cli-tasks
npm install @tsed/cli-mcp --save-dev # optional MCP server
```

```bash [yarn]
yarn add @tsed/cli-core @tsed/cli-prompts @tsed/cli-tasks
yarn add -D @tsed/cli-mcp # optional
```

```bash [pnpm]
pnpm add @tsed/cli-core @tsed/cli-prompts @tsed/cli-tasks
pnpm add -D @tsed/cli-mcp # optional
```

```bash [bun]
bun add @tsed/cli-core @tsed/cli-prompts @tsed/cli-tasks
bun add -d @tsed/cli-mcp # optional
```

:::

2. Adopt the same project layout the official CLI uses so your commands, tools, resources, and templates stay discoverable:

```txt
my-cli/
├─ package.json
├─ tsconfig.json
└─ src/
   ├─ bin/
   │  └─ index.ts
   ├─ commands/
   │  └─ InteractiveWelcome.ts
   ├─ resources/
   ├─ tools/
   ├─ prompts/
   └─ templates/
```

Peeking at `packages/cli/src/bin/tsed.ts` in this repo shows the exact layout Ts.ED uses in production.

3. Register prompts, tasks, and commands. Pick whichever API fits your style—decorators @@Command@@ or the @@command@@ helper:

::: code-group

<<< @/examples/cli/overview-quickstart.ts [Decorators]
<<< @/examples/cli/overview-quickstart-functional.ts [Functional API + inputSchema]

:::

4. Bootstrap the runtime in `src/bin/index.ts` (or any entrypoint under `src/bin`). This mirrors the official `packages/cli/src/bin/tsed.ts` entrypoint without the module-alias hook:

<<< @/examples/cli/bootstrap.ts

5. Execute commands through Node + SWC so both the functional API and decorators work without a build step:

```bash
 node --import @swc-node/register/esm-register src/bin/index.ts interactive:welcome
```

- guides the user through a `PromptRunner`-powered conversation to collect inputs,
- hands the data to `@tsed/cli-tasks` so each `Task<Context>` streams logs through the shared renderer,
- and persists the result via any Ts.ED service available in DI.

## Where to go next

- Learn how to configure `@Command`/`command()` in [Commands](/guide/cli/commands).
- Compose rich multi-step conversations in [Prompts](/guide/cli/prompts).
- Stream progress, handle retries, and chain subtasks in [Tasks](/guide/cli/tasks).
- Learn how to expose the CLI over MCP in [MCP servers](/guide/cli/mcp).
