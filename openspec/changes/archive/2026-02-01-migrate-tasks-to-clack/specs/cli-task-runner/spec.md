## ADDED Requirements

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
