# Change: Migrate CLI task runner from Listr2 to @clack/prompts internals

## Why

Even after introducing `@tsed/cli-tasks`, every command still depends on Listr2 behavior (renderers, concurrency defaults, task wrapper API). That keeps Ts.ED tied to an aging dependency, forces dual theming (Clack for prompts, Listr for tasks), and blocks richer UX features (streaming status, cancellable flows, consistent logger output) that Clack already provides. Owning the runner behind `@tsed/cli-tasks` gives us the perfect seam to swap its implementation to Clack primitives and eliminate Listr entirely.

## What Changes

- Replace the Listr-backed implementation inside `@tsed/cli-tasks` with Clack’s task/spinner utilities, preserving the public helpers (`createTasks`, `createSubTasks`, `createTasksRunner`) while reimplementing their internals.
- Port logger binding, concurrency flags, and nested task behavior to the Clack-based runner so `cli-core`, `cli`, and plugins continue working without signature changes.
- Update `@tsed/cli-core`, `@tsed/cli`, and plugin docs/tests to reflect the Clack-powered task system, ensuring snapshots and expectations match the new renderer output.
- Remove the Listr dependency from the monorepo (root + any workspace lockfiles) and add the minimal Clack extras, keeping `@tsed/cli-tasks` the sole owner of the new dependency surface.

## Impact

- Affected specs: `cli-task-runner`
- Affected code: `packages/cli-tasks` (all runner files + tests), `packages/cli-core` (imports + docs), `packages/cli` templates/tests, plugin snapshots referencing Listr output, root and workspace package manifests/lockfile entries for Listr.
