## ADDED Requirements

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
