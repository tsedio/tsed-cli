# cli-task-runner Specification

## Purpose

TBD - created by archiving change add-cli-tasks-package. Update Purpose after archive.

## Requirements

### Requirement: Task runner lives in @tsed/cli-tasks

A dedicated `@tsed/cli-tasks` package SHALL own the task runner implementation, exporting Ts.ED-branded `Task`/`Tasks`/`TaskRunnerOptions` types plus helpers for creating/nesting tasks, while encapsulating `listr2` as an internal dependency.

#### Scenario: CLI core depends on the abstraction instead of listr2

- **WHEN** inspecting `packages/cli-core` (package.json and source imports)
- **THEN** it references `@tsed/cli-tasks` for task helpers/types and no longer imports `listr2` or its types directly.

### Requirement: Commands and plugins import Task types from @tsed/cli-tasks

All first-party commands, templates, and plugins SHALL reference the new package for `Task`/`Tasks` typings (optionally via `cli-core` re-exports), ensuring no other workspace couples to `listr2` APIs.

#### Scenario: Plugin hooks compile without listr2

- **WHEN** building packages such as `cli-plugin-eslint`, `cli-plugin-prisma`, and `packages/cli` commands
- **THEN** their source files import `Task` (and helpers) from `@tsed/cli-tasks`/`@tsed/cli-core` exports without mentioning `listr2`, and type-check succeeds.

### Requirement: Runner accepts injectable logger bindings

The task runner SHALL accept an optional logger adapter (info/error) so Ts.ED can forward task output through its DI logger while other consumers can omit it, keeping the runner decoupled from `cli-core` internals.

#### Scenario: CLI tasks still log through Ts.ED logger

- **WHEN** `CliService` runs tasks with `createTasksRunner`
- **THEN** it passes the Ts.ED logger (or binding flag) into the runner options and task output appears via the existing CLI logger, even though the runner lives in `@tsed/cli-tasks`.

### Requirement: Documentation and scaffolding describe the new package

CLI documentation and templates SHALL reference `@tsed/cli-tasks` as the supported way to define tasks and remove language that instructs developers to rely on Listr directly.

#### Scenario: Command template references cli-tasks

- **WHEN** inspecting `packages/cli/src/templates/command.template.ts` and `packages/cli-core/readme.md`
- **THEN** they describe the Ts.ED task helpers, mention `@tsed/cli-tasks`, and avoid pointing users to raw Listr APIs.

### Requirement: Task runner executes via @clack/prompts primitives

`@tsed/cli-tasks` SHALL implement `createTasks`/`createTasksRunner`/`createSubTasks` on top of `@clack/prompts` so the CLI’s task execution experience uses the same renderer stack as prompts and no longer depends on Listr2.

#### Scenario: createTasksRunner delegates to Clack

- **WHEN** inspecting `packages/cli-tasks`
- **THEN** its dependencies reference `@clack/prompts` (not `listr2`), and the helper implementations call Clack APIs to render/execute tasks.

### Requirement: Logger binding and nested tasks remain functional after the migration

The Clack-backed runner MUST continue to honor the existing options (`logger`, `bindLogger`, `concurrent`, nested task factories) so commands and plugins behave the same despite the engine swap.

#### Scenario: CLI commands run nested tasks with Clack

- **WHEN** a command (e.g., `tsed init`) runs a task that calls `createSubTasks`
- **THEN** the nested tasks execute through the Clack runner, respect `concurrent` flags, and forward log output through the provided Ts.ED logger just as before.
