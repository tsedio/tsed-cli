# Project Context

## Purpose

Ts.ED CLI (plus MCP tooling) scaffolds and maintains Ts.ED server applications. It bootstraps new projects, generates framework-specific blueprints, exposes MCP tools/resources, and documents the ecosystem for contributors.

## Tech Stack

- TypeScript ES modules targeting Node.js (Ts.ED runtime + CLI core)
- Yarn 4 (Berry) + Lerna workspaces orchestrating packages under `packages/*`
- Vitest for unit/integration tests, ESLint (flat config) + Prettier for lint/format
- VuePress + TSDoc to publish documentation, Ts.ED DI and schema packages for configuration metadata

## Project Conventions

### Code Style

- 2-space indentation, double quotes, trailing commas; follow shared Prettier rules
- Prefer named exports; suffix CLI command providers with `Cmd`
- Keep import blocks sorted (`eslint-plugin-simple-import-sort`) and stay in TypeScript ESM syntax

### Architecture Patterns

- Monorepo packages split responsibilities: `cli` (commands/templates), `cli-core` (DI/prompt infra), `cli-mcp` (MCP servers/tools), `cli-plugin-*` (blueprints/tests), `cli-testing` (shared harness)
- Templates live under `packages/cli/templates`; generated artifacts land in `dist/`
- Docs (VuePress + TSDoc) reside in `docs/`; automation scripts under `tools/*`

### Testing Strategy

- Vitest powers unit/integration suites; colocate fast tests next to implementations and heavier scenarios under `packages/*/test/**`
- Use helpers from `cli-testing` to mock filesystem interactions; avoid touching the real disk
- Run `yarn test --coverage` before PRs so CI enforces thresholds

### Git Workflow

- Conventional Commits with workspace scopes (e.g., `feat(cli-plugin-prisma): ...`) and subjects under 200 characters
- Before opening PRs run `yarn build`, `yarn test`, and `yarn lint`; update docs/templates when behavior changes and link related issues

## Domain Context

Ts.ED is a TypeScript server framework; this repo’s CLI packages bootstrap projects, manage generators, and surface MCP resources so LLM-based assistants can create or modify Ts.ED apps via structured tools. Plugins package feature-specific blueprints (ORMs, config sources), while templates, docs, and automation scripts keep developers aligned.

## Important Constraints

- Favor straightforward, minimal implementations before introducing abstractions
- Keep changes scoped; avoid destructive git commands and do not revert user work
- Default to ASCII text, leverage `rg` for searches, and respect Yarn/Lerna workspace boundaries

## External Dependencies

- Node.js runtime with Ts.ED DI/schemas, @tsed/cli-core, and related packages
- Yarn 4 + Lerna for workspace management, Vitest/ESLint/Prettier tooling, VuePress + TSDoc for documentation
- MCP SDK for server integration and any framework-specific plugins (Prisma, Mongoose, TypeORM, etc.)
