---
title: Task orchestration
description: Stream progress, logs, and cancellations with @tsed/cli-tasks.
---

# Tasks & orchestration

`@tsed/cli-tasks` provides a renderer-agnostic task runner for the CLI. Commands return arrays of `Task<Context>` objects and each task receives a `TaskLogger` that streams status updates, warnings, and errors through the shared renderer.

## Task lifecycle

1. Define tasks by returning `Task<Context>[]` from `$exec` (or a `command({handler})`).
2. Each task receives `(ctx, logger)` arguments—`ctx` is your command context, `logger` is a `TaskLogger`.
3. Call `logger.message/info/warn` to emit updates and attach listeners to subprocess streams for live output.
4. Implement your own `ctx.onCancel` helper (as shown in the snippet) if you need cooperative cancellation.

The following example performs a package installation, streams child-process output, and emits nested progress bars:

<<< @/examples/cli/task-runner.ts

## Progress & streaming tips

- **Emit frequent updates:** Users expect feedback every few seconds. Use `logger.message()` / `logger.info()` to describe the current step.
- **Group subtasks:** Split work into several small tasks so the renderer can mark them as completed one by one.
- **Stream child processes:** Pipe `execa`/`spawn` output through the task logger (see snippet) to reuse the CLI's styling and log buffering.

## Error handling and cancellation

- Throw errors (or `CliTaskError`) so the renderer can surface actionable hints—any rejection aborts the remaining tasks.
- Provide a simple cancellation API in your context (e.g., store `Set<() => void>` and call each handler on `SIGINT`) so long-running subprocesses can exit gracefully.
- Retry flaky operations by wrapping task logic in your own helper (for example, re-running a fetch up to three times before bubbling the error).

Combine tasks with prompts to build full interactive flows: prompts capture intent, tasks do the work, and the CLI renderer keeps developers informed the entire time.
