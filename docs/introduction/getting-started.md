# Getting started

Ts.ED ships an opinionated CLI runtime that can scaffold full Ts.ED applications, automate everyday chores, and even expose its capabilities over MCP. If you want the bigger architectural picture before diving in, start with the [CLI overview](/guide/cli/overview) and then come back here to get hands-on.

## Core building blocks

The CLI runtime layers `@tsed/cli-core` with optional packages so you can dial in as much interactivity as you need:

- `@tsed/cli-core` loads the Ts.ED DI container (or your own), resolves commands, and discovers plugins at runtime.
- `@tsed/cli-prompts` lets you orchestrate conversational flows with shareable prompt providers.
- `@tsed/cli-tasks` runs ordered task lists and streams progress/logs in the terminal.
- `@tsed/cli-mcp` wraps the same DI context in a Model Context Protocol server so AI agents can call your tools safely.

Every example in the CLI guides works in two contexts:

- **Ts.ED projects** created via `tsed init` keep using the default DI container plus any framework services you register.
- **Standalone CLIs** that import `@tsed/cli-core` can register identical commands/prompts/tasks without pulling in the rest of Ts.ED. You decide which packages to include.

## Install the CLI binary

Install globally or add it to your devDependencies:

```bash
npm install -g @tsed/cli
# or, inside a repository
npm install --save-dev @tsed/cli
```

The binary exposes `tsed` for classic shell use and `tsed-mcp` for launching the bundled MCP server.

## Bootstrap a project quickly

Use the `tsed` executable to explore commands or scaffold a new service:

```bash
tsed -h
tsed generate -h

mkdir my-api && cd my-api
tsed init .
npm start # or yarn start
```

The generator walks you through prompts (powered by `@tsed/cli-prompts`) and streams build steps through `@tsed/cli-tasks`. Popular integrations—Jest, Mocha, ESLint/Prettier, Passport, and more—are available out of the box via official CLI plugins, and you can install community plugins later simply by adding them to `package.json`.

## Build your own CLI with `@tsed/cli-core`

Want the runtime without the Ts.ED framework template? Install `@tsed/cli-core` (plus whichever companion packages you need) inside any TypeScript project:

```bash
npm install @tsed/cli-core @tsed/cli-prompts @tsed/cli-tasks
```

Define commands with the decorator API, register prompts/tasks, and optionally expose the same tools through `@tsed/cli-mcp`. Because the DI container is configurable, you can:

- bootstrap a pure CLI that only relies on your own services, or
- reuse the existing Ts.ED DI modules from a server project.

All of the snippets referenced throughout the CLI documentation—prompts, tasks, MCP servers—work in both setups. Swap in your own providers during bootstrap to keep logic shared between multiple CLIs or between the CLI and your backend services.

Need to run the CLI behind a corporate proxy or custom network stack? Check the [configuration guide](./configuration.md) for the supported npm config keys and environment variables.

## Built-in commands

The `tsed` binary ships with several commands across project scaffolding, generators, and maintenance tasks:

| Command                                  | Description                                                               |
| ---------------------------------------- | ------------------------------------------------------------------------- |
| `tsed init [root]`                       | Scaffold a new Ts.ED project with prompts and templates.                  |
| `tsed init-options`                      | Print every `tsed init` flag (handy for CI or tooling).                   |
| `tsed generate [type] [name]` / `tsed g` | Run a generator template (controllers, services, custom templates, etc.). |
| `tsed template [name]`                   | Create or scaffold a `defineTemplate()` file inside `.templates/`.        |
| `tsed add [name]`                        | Install a CLI plugin (e.g., `@tsed/cli-plugin-<feature>`).                |
| `tsed run <command>`                     | Proxy to project-level scripts (with SWC already wired).                  |
| `tsed update`                            | Update Ts.ED packages used by the current project.                        |
| `tsed mcp [options]`                     | Launch the bundled MCP server (stdio or HTTP).                            |

See `tsed --help` for the latest list, or read the [Commands guide](/guide/cli/commands) for every decorator/`command()` option.
