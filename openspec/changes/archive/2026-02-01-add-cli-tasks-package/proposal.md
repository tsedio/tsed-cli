# Change: Introduce @tsed/cli-tasks to own the task runner

## Why

`@tsed/cli-core` and `@tsed/cli` embed their Listr2 usage directly. The `Task` types exported today are thin aliases to Listr and force every command, template, and plugin to depend on Listr APIs that we do not control. This tight coupling makes it risky to change renderers, switch task engines, or even customize logging because the implementation details leak across the ecosystem. Centralizing the task runner inside a dedicated package lets us hide Listr behind a Ts.ED-controlled boundary, share helpers between core/CLI/plugins, and unblock future renderer or engine changes without mass rewrites.

## What Changes

- Add a new `@tsed/cli-tasks` workspace that exposes Ts.ED-owned `Task`, `Tasks`, and `TaskRunnerOptions` types plus helpers such as `createTasksRunner`, `createSubTasks`, and `createTasks`.
- Move the existing Listr2 configuration (renderers, logger binding, nested task helpers) into the new package so `@tsed/cli-core` no longer imports `listr2` directly; instead it consumes the abstraction and re-exports types for convenience.
- Update `@tsed/cli`, `cli-core`, and all first-party plugins/templates to import `Task` (and helpers) from `@tsed/cli-tasks`, ensuring no workspace couples to `listr2`.
- Allow the task runner to accept a Ts.ED logger (or noop) so CLI output can still flow through the existing logging infrastructure without forcing `cli-tasks` to know about DI internals.
- Refresh documentation (CLI README, command template guidance) to describe the new package and remove direct references to Listr.

## Impact

- Affected specs: `cli-task-runner`
- Affected code: `packages/cli-core` task utilities, `packages/cli` command implementations, `packages/cli-plugin-*` hooks importing `Task`, generator templates, and root/cli-core `package.json` dependencies (Listr moves to the new package).
