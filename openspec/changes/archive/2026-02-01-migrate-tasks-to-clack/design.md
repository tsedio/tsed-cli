## Context

- `@tsed/cli-tasks` currently wraps Listr2’s `Listr` class plus renderers and logging hooks. Consumers call `createTasks`/`createSubTasks`/`createTasksRunner`, which return Listr instances configured with Verbose vs Default renderer and a `TaskLoggerAdapter` to route logs through Ts.ED’s logger.
- The CLI already standardized prompts on `@clack/prompts`, so the UX mixes Clack for questions and Listr for execution. That means two distinct renderer stacks, two dependency trees, and limited ability to surface interactive affordances consistently.
- Clack exposes `spinner`, `intro`/`outro`, `task` helpers, and low-level APIs to drive iterative task feedback using the same renderer as prompts. Replatforming the task runner on Clack removes Listr entirely while keeping the Ts.ED-owned helper API stable.

## Goals / Non-Goals

- **Goals**
  - Reimplement `@tsed/cli-tasks` helpers using Clack primitives while retaining the public API surface (helpers + options) so downstream packages don’t change.
  - Preserve behaviors that commands rely on: sequential or concurrent execution, nested task composition, logger binding, `silentRendererCondition` during tests, and support for async task factories.
  - Remove `listr2` from every workspace that previously depended on it, ensuring the monorepo’s dependency graph no longer includes Listr.
  - Update docs/tests to reflect the Clack-based experience (including any changes to snapshot text or logging expectations).
- **Non-Goals**
  - Introducing a brand new public API for task definitions (we keep the existing helper signatures for now).
  - Redesigning every command’s task list or adding new CLI commands—this change is purely about the runner implementation.
  - Reworking prompt behavior (already handled by the previous Clack migration).

## Decisions

1. **Adapter strategy**: `@tsed/cli-tasks` remains the only place that knows about the underlying task engine. We translate Listr-esque task definitions into Clack flows by iterating through the `Tasks` array, invoking each `task` function manually, and handling concurrency via `Promise.allSettled` when `concurrent` is truthy.
2. **Renderer parity**: Clack’s `task` helper will produce the default renderer; when `verbose` is true (or CI is set), we’ll use Clack’s `intro`/`outro` plus `spinner` output to mirror the old verbose logs. For non-verbose runs we’ll rely on Clack’s standard live task view. Tests continue to use the silent path.
3. **Logger binding**: Instead of Listr’s logger adapter, we’ll wrap Clack’s log hooks (e.g., custom `message` events) to call the injected Ts.ED logger. If Clack doesn’t expose a direct logger interface, we’ll emit log lines ourselves before/after each task.
4. **Nested tasks**: `createSubTasks` will run subtasks sequentially in the same Clack pipeline by invoking `task.newListr` equivalent logic via a helper that simply calls `runTasks(subset, options)`; the helper returns an async function (ctx, task) matching the previous signature so existing callers don’t change.
5. **Error handling & cancelation**: We’ll map Clack cancelation (if introduced later) to the same rejection flow that Listr had: throw errors to bubble up, log them through the bound logger, and ensure `CliService` catches them as before.

## Risks / Trade-offs

- Clack’s task utilities are less feature-rich than Listr (no built-in concurrency scheduler, no tree view). We mitigate this by reimplementing only the concurrency features we actually use (mostly sequential tasks + occasional `concurrent: false` overrides).
- Snapshot churn: switching renderers may tweak textual output from templates/tests. We’ll limit churn by scoping unit tests to structural behavior rather than exact formatting wherever possible, but some snapshots (like template scaffolds referencing instructions) will be updated intentionally.
- Potential behavior drift (e.g., subtask progress). We’ll add dedicated tests in `@tsed/cli-tasks` to assert sequential vs concurrent behavior and logging hooks, plus smoke tests in `cli-core` to ensure commands still execute tasks in order.

## Migration Plan

1. Update `@tsed/cli-tasks`: replace the Listr dependency with Clack, rewrite `createTasksRunner` internals, and expand tests to cover verbose vs default output, nested tasks, concurrency, and logger binding.
2. Remove Listr from root + workspace manifests/lockfiles.
3. Adjust docs/templates to reference the Clack-based runner.
4. Update any tests or snapshots that referenced Listr-specific output.
5. Run targeted and full Vitest suites plus a CLI smoke test to confirm task execution still works end to end.

## Open Questions

- Do we need to expose any new configuration options (e.g., customizing Clack theme)? For now we’ll keep the API unchanged and revisit later.
- Should we add a polyfill for Listr’s `task.skip` or `retry` features? Current core usage doesn’t depend on them, so we’ll document the omission unless new requirements surface.
