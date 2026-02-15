# cli-tasks-docs Specification

## Purpose

Track the expectations for `@tsed/cli-tasks` documentation so orchestration concepts, progress reporting, and failure handling are consistently described.

## Requirements

### Requirement: Tasks guide introduces orchestration concepts

The documentation SHALL describe how `@tsed/cli-tasks` models tasks, subtasks, progress updates, and streaming logs, including how tasks are registered and invoked from commands.

#### Scenario: Task lifecycle explained

- **WHEN** a developer reads the introduction
- **THEN** it outlines the lifecycle from task creation to completion, including hooks for progress updates

#### Scenario: Registration example present

- **WHEN** the guide discusses integration
- **THEN** it shows how to register tasks via Ts.ED decorators or the CLI task registry

### Requirement: Guide contains progress and streaming examples

The documentation SHALL provide TypeScript samples that emit progress percentages, nested task status, and streamed stdout/stderr so developers can mirror the interactive CLI experience.

#### Scenario: Progress reporting snippet available

- **WHEN** the developer copies the progress example
- **THEN** it demonstrates using the task logger to emit progress/ETA updates during long-running work

#### Scenario: Streaming logs snippet available

- **WHEN** the streaming section is read
- **THEN** it shows how to pipe child process output through a task to the terminal

### Requirement: Guide covers error handling and cancellation

The tasks documentation SHALL explain how to surface failures, retry logic, and cooperative cancellation so commands behave predictably under adverse conditions.

#### Scenario: Error handling guidance present

- **WHEN** a developer searches for failure handling
- **THEN** the guide explains how to throw structured errors that the CLI formats for users

#### Scenario: Cancellation example present

- **WHEN** the developer reads about cancellation
- **THEN** it includes a code sample that wires a custom `ctx.onCancel()` helper (e.g., tied to `SIGINT`) so tasks exit gracefully
