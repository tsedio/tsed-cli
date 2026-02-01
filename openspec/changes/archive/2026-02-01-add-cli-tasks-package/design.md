## Context

- Listr2 is imported directly inside `packages/cli-core/src/utils/createTasksRunner.ts`, and its types (`ListrTask`, `ListrBaseClassOptions`) are re-exported via the `Task`/`Tasks` aliases. Every command, hook, and template consumes those aliases from `@tsed/cli-core`, effectively binding the ecosystem to Listr-specific concepts (renderers, logger shape, task wrapper signature).
- The CLI logger integration is hard-coded inside `createTasksRunner.ts` by referencing `getLogger()`. This prevents other consumers (e.g., MCP tooling or standalone scripts) from reusing the task runner without also importing `cli-core`.
- We need a sharable, Ts.ED-branded abstraction that hides Listr details, exposes a stable API, and can later swap implementations without touching every caller.

## Goals / Non-Goals

- **Goals:**
  - Provide a new `@tsed/cli-tasks` package that owns the task runner implementation, types, and helper utilities.
  - Preserve the current behavior of nested tasks, concurrency toggles, and verbose renderer selection so existing commands continue to work.
  - Allow consumers to optionally bind a Ts.ED logger (or any compatible logger) without coupling `cli-tasks` to `cli-core` internals.
  - Make `Task`, `Tasks`, and runner helpers available to all workspaces (CLI, plugins, templates) without importing `listr2`.
- **Non-Goals:**
  - Changing the end-user task experience or swapping out Listr at this stage (the package simply wraps it).
  - Rewriting CLI task definitions; only import paths and helper usage change.
  - Altering DI bootstrap or the command lifecycle outside of the task runner abstraction.

## Decisions

1. **Package boundaries:**
   - `packages/cli-tasks` mirrors other shared packages (source entry at `src/index.ts`, build via `tsconfig.esm.json`) and declares its own dependency on `listr2` plus `@tsed/logger` types for optional logging helpers.
   - The package exports:
     - `Task`/`Tasks` types that alias Listr types internally but are branded as Ts.ED contracts.
     - `TaskRunnerOptions` describing concurrency, renderer selection, and a `logger?: TaskLogger` primitive with `info`/`error` methods so we can plug in Ts.ED's logger.
     - Helpers: `createTasks`, `createTasksRunner`, `createSubTasks`, `createTasksOptions` (internal) to keep CLI ergonomics unchanged.
2. **Logger integration:**
   - Rather than calling `getLogger()` inside the package, we accept a `logger` option (or a `bindLogger` flag) from consumers. `cli-core` passes its DI logger wrapper when it wants runner logs to flow through Ts.ED, while tests or other consumers can omit it.
   - A small `TaskLoggerAdapter` translates the `TaskLogger` interface into Listr's `Logger` API so the runner stays decoupled from Ts.ED logging specifics.
3. **Renderer defaults:**
   - Verbose renderer remains the default when `ctx.verbose` or `CI` is set; otherwise we use Listr's default renderer. These heuristics move intact into the new package to avoid regressions.
   - We keep the `silentRendererCondition` for `NODE_ENV=test` inside the new helper so current Vitest behavior is preserved.
4. **Migration path:**
   - `@tsed/cli-core` depends on `@tsed/cli-tasks` and re-exports its types via `src/interfaces/index.ts` so downstream packages can either import directly from `@tsed/cli-tasks` or continue using the aggregated export without seeing `listr2`.
   - CLI commands/templates update their imports to point at `@tsed/cli-tasks` (preferred) to make the boundary explicit. This also surfaces the new package to plugin authors.

## Risks / Trade-offs

- Adding a new package increases build time slightly, but it keeps the Listr dependency isolated and makes future engine swaps simpler.
- If we miss an import update, some packages might still pull `Task` from `@tsed/cli-core`, so we need lint/test coverage plus `rg` checks to ensure the migration is complete.
- Sharing logger bindings via options could expose subtle differences if consumers pass a logger without both `info` and `error`; we mitigate this with type definitions and defensive defaults (console fallback).

## Migration Plan

1. Scaffold `@tsed/cli-tasks` with the runner implementation copied from `cli-core`, updated to accept an injected logger.
2. Point `cli-core` utilities (`CliService`, `CliPlugins`, command hooks) to the new package and re-export the Task types for backwards compatibility.
3. Update `@tsed/cli` commands, templates, and plugin packages to import `Task`/`Tasks`/helpers from `@tsed/cli-tasks`.
4. Remove the direct `listr2` dependency from workspaces that no longer need it (root + `cli-core`).
5. Refresh docs/templates to mention the new package and note that Listr is now abstracted.

## Open Questions

- Do we want `cli-tasks` to expose additional helpers (e.g., progress bars, streaming output) in phase one, or should we keep the surface limited to the existing runner API? (Default is to keep the current API and expand later.)
