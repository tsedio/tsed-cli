---
title: Task orchestration
description: Stream progress, logs, and cancellations with @tsed/cli-tasks.
---

# Tasks & orchestration

`@tsed/cli-tasks` provides a renderer-agnostic task runner for the CLI. Commands return arrays of `Task<Context>` objects and each task receives a `TaskLogger` that streams status updates, warnings, and errors through the shared renderer.

## Task lifecycle

1. Define tasks by returning `Task<Context>[]` from `$exec` (or a `command({handler})`).
2. Each task receives `(ctx, logger)` arguments—`ctx` is your command context, `logger` is a @@TaskLogger@@.
3. Call `logger.message/info/warn` to emit updates and attach listeners to subprocess streams for live output.
4. Provide whatever cancellation wiring you need (for example, track a list of cleanup callbacks and trigger them on `SIGINT`).

The following examples perform package installation, stream child-process output, and emit nested progress bars—one using @@Command@@, the other using @@command@@:

::: code-group

<<< @/examples/cli/tasks-command-decorators.ts [Decorators]
<<< @/examples/cli/tasks-command-functional.ts [Functional API]

:::

## Promise vs Observable

Every `task(ctx, logger)` can return either a `Promise` or an RxJS `Observable`. Promises suit discrete work, while Observables shine when you need to stream multiple updates (for example, piping `CliExeca.run` output):

```ts
import type {Task} from "@tsed/cli-tasks";
import {CliExeca} from "@tsed/cli-core";
import {inject} from "@tsed/di";
import {interval, take} from "rxjs";

const cliExeca = inject(CliExeca);

export const auditTask: Task = {
  title: "Security audit",
  task: () => interval(250).pipe(take(4)) // Observable emits incremental progress
};

export const installTask: Task = {
  title: "Install dependencies",
  async task(ctx, logger) {
    logger.message("Spawning package manager...");
    return cliExeca.run("npm", ["install"], {cwd: ctx.projectDir});
  }
};
```

::: tip
Stream child processes by piping `CliExeca.run()` output through the task logger (as shown above) to reuse the CLI’s styling and log buffering.
:::

## Nested subtasks

Return `Task[]` from a task to enqueue subtasks dynamically once earlier work finishes:

```ts
async function uploadArtifacts() {
  /* omitted */
}

async function publishTag() {
  /* omitted */
}

export const deployTask: Task = {
  title: "Deploy release",
  async task(_ctx, logger) {
    logger.message("Creating release...");
    return [
      {title: "Upload artifacts", task: () => uploadArtifacts()},
      {title: "Publish tag", task: () => publishTag()}
    ];
  }
};
```

## Conditional `skip` / `enabled`

`skip` and `enabled` accept booleans, strings (rendered as the skip reason), or predicates that inspect the current context:

```ts
const task = {
  title: "Publish package",
  enabled: (ctx) => ctx.shouldPublish,
  skip: (ctx) => (!ctx.changesDetected ? "No changes detected" : false),
  task: async (_ctx, logger) => {
    logger.message("Pushing package to registry...");
  }
};
```

## Rendering customization

Set the `type` field on a task to control which renderer @@TaskLogger@@ uses. Supported values match `TaskLoggerOptions["type"]` (see @@Task@@).

::: tip
Use `logger.renderMode = "raw"` (or run with `NODE_ENV=test`) when you need machine-readable output (the logger falls back to structured logs instead of interactive components).
:::

### Progress bars

```ts
import type {Task} from "@tsed/cli-tasks";

export const buildTask: Task = {
  title: "Build artifacts",
  type: "progress",
  async task(_ctx, logger) {
    for (const step of ["Bundle commands", "Emit types", "Copy templates"]) {
      logger.message(step);
      logger.advance(33); // 33%
    }
  }
};
```

### Spinners

```ts
export const lintTask: Task = {
  title: "Lint sources",
  type: "spinner",
  task: async (_ctx, logger) => {
    logger.message("Running ESLint...");
    await runLint();
  }
};
```

### Nested groups/task logs

```ts
export const releaseTask: Task = {
  title: "Release package",
  type: "group",
  async task(ctx) {
    return [
      {title: "Bump version", type: "taskLog", task: () => ctx.pkg.bump()},
      {title: "Publish", type: "taskLog", task: () => ctx.registry.publish()}
    ];
  }
};
```

## Error handling and cancellation

- Throw errors (or `CliTaskError`) so the renderer can surface actionable hints—any rejection aborts the remaining tasks.
- Provide a simple cancellation API in your context (for example, store `Set<() => void>` callbacks and call each handler on `SIGINT`) so long-running subprocesses can exit gracefully.
- Retry flaky operations by wrapping task logic in your own helper (for example, re-running a fetch up to three times before bubbling the error).

Combine tasks with prompts to build full interactive flows: prompts capture intent, tasks do the work, and the CLI renderer keeps developers informed the entire time.
