## Why

Ts.ED users rely on the CLI to scaffold projects, but the current VitePress docs barely mention the new interactive tooling. Developers experimenting with `@tsed/cli-mcp`, `@tsed/cli-prompts`, and `@tsed/cli-tasks` lack a single source explaining capabilities, setup, and extension points, slowing adoption of the latest CLI release.

## What Changes

- Add a VitePress section dedicated to the CLI, highlighting how the new interactive runtime works and when to use it.
- Document each new package (`cli-mcp`, `cli-prompts`, `cli-tasks`) with installation steps, TypeScript examples, and integration tips.
- Provide task- and prompt-building walkthroughs so contributors can extend the CLI without reading source code.
- Refresh navigation, landing cards, and callouts so developers can discover CLI topics directly from the docs home page.

## Capabilities

### New Capabilities

- `vitepress-cli-overview`: Central CLI landing page describing supported commands, architecture, and compatibility.
- `cli-mcp-docs`: Reference and examples for exposing MCP servers via `@tsed/cli-mcp`.
- `cli-prompts-docs`: Guide for composing interactive prompts with `@tsed/cli-prompts`, including validation patterns.
- `cli-tasks-docs`: Task orchestration guide covering streaming logs, progress reporting, and composition with `@tsed/cli-tasks`.

### Modified Capabilities

- None.

## Impact

- VitePress content under `docs/guide` and related navigation configs.
- CLI package READMEs and code samples in `packages/cli`, `packages/cli-mcp`, `packages/cli-prompts`, and `packages/cli-tasks` for snippet reuse.
- Developer onboarding materials and release notes referencing CLI functionality.
