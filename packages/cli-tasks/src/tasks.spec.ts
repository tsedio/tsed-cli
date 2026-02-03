import {context, DITest, runInContext} from "@tsed/di";
import {Observable} from "rxjs";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";

import {TaskLogger, type TaskLoggerOptions} from "./domain/TaskLogger.js";
import type {Task} from "./interfaces/Task.js";
import {concat, tasks} from "./tasks.js";

type LoggerStub = {
  title: string;
  type?: TaskLoggerOptions["type"];
  parent?: TaskLogger;
  max: number;
  start: ReturnType<typeof vi.fn>;
  done: ReturnType<typeof vi.fn>;
  skip: ReturnType<typeof vi.fn>;
  error: ReturnType<typeof vi.fn>;
  message: ReturnType<typeof vi.fn>;
  info: ReturnType<typeof vi.fn>;
  warn: ReturnType<typeof vi.fn>;
  advance: ReturnType<typeof vi.fn>;
  log: ReturnType<typeof vi.fn>;
  report: ReturnType<typeof vi.fn>;
};

function createLoggerStub(opts: TaskLoggerOptions) {
  const stub: LoggerStub = {
    title: opts.title,
    type: opts.type,
    parent: opts.parent,
    max: 0,
    start: vi.fn().mockReturnThis(),
    done: vi.fn().mockReturnThis(),
    skip: vi.fn().mockReturnThis(),
    error: vi.fn().mockReturnThis(),
    message: vi.fn().mockReturnThis(),
    info: vi.fn().mockReturnThis(),
    warn: vi.fn().mockReturnThis(),
    advance: vi.fn().mockReturnThis(),
    log: vi.fn().mockReturnThis(),
    report: vi.fn().mockReturnThis()
  };

  return stub as LoggerStub & TaskLogger;
}

function mockTaskLoggers() {
  const loggers = new Map<string, LoggerStub & TaskLogger>();
  vi.spyOn(TaskLogger, "from").mockImplementation((opts) => {
    const stub = createLoggerStub(opts);
    loggers.set(opts.title, stub);
    return stub;
  });

  return loggers;
}

function getLevelLabel(level: any) {
  return typeof level === "string" ? level : level?.levelStr;
}

describe("tasks()", () => {
  beforeEach(() =>
    DITest.create({
      env: "test"
    })
  );

  afterEach(() => {
    vi.restoreAllMocks();
    return DITest.reset();
  });

  it("logs each emission from observable task results", async () => {
    const loggers = mockTaskLoggers();

    const observableTask$ = new Observable<string>((subscriber) => {
      subscriber.next("first-line");
      subscriber.next("second-line");
      subscriber.complete();
    });

    const observableTask: Task = {
      title: "Observable task",
      task: () => observableTask$
    };

    const ctx = DITest.createDIContext();

    await runInContext(ctx, () => tasks([observableTask], {}));

    const logger = loggers.get("Observable task");
    expect(logger?.message).toHaveBeenCalledTimes(2);
    expect(logger?.message).toHaveBeenNthCalledWith(1, "first-line");
    expect(logger?.message).toHaveBeenNthCalledWith(2, "second-line");
  });

  it("skips tasks when enabled predicate resolves false", async () => {
    const loggers = mockTaskLoggers();
    const disabledSpy = vi.fn();
    const activeSpy = vi.fn();

    const ctx = DITest.createDIContext();
    await runInContext(ctx, () =>
      tasks(
        [
          {
            title: "Disabled task",
            enabled: () => false,
            task: disabledSpy
          },
          {
            title: "Active task",
            task: activeSpy
          }
        ],
        {}
      )
    );

    expect(disabledSpy).not.toHaveBeenCalled();
    expect(activeSpy).toHaveBeenCalledTimes(1);
    expect(loggers.get("Disabled task")?.skip).toHaveBeenCalledTimes(1);
    expect(loggers.get("Active task")?.start).toHaveBeenCalledTimes(1);
    expect(loggers.get("Active task")?.done).toHaveBeenCalledTimes(1);
  });

  it("skips tasks when skip predicate resolves truthy", async () => {
    const loggers = mockTaskLoggers();
    const skippedSpy = vi.fn();

    const ctx = DITest.createDIContext();
    await runInContext(ctx, () =>
      tasks(
        [
          {
            title: "Skippable task",
            skip: () => "skip",
            task: skippedSpy
          }
        ],
        {}
      )
    );

    expect(skippedSpy).not.toHaveBeenCalled();
    expect(loggers.get("Skippable task")?.skip).toHaveBeenCalledTimes(1);
  });

  it("runs nested tasks returned from a task result", async () => {
    const loggers = mockTaskLoggers();
    const order: string[] = [];

    const ctx = DITest.createDIContext();
    await runInContext(ctx, () =>
      tasks(
        [
          {
            title: "Parent task",
            task: () => [
              {
                title: "Child sync",
                task: () => {
                  order.push("sync");
                }
              },
              {
                title: "Child async",
                task: () =>
                  Promise.resolve().then(() => {
                    order.push("async");
                  })
              }
            ]
          }
        ],
        {}
      )
    );

    expect(order).toEqual(["sync", "async"]);
    expect(loggers.get("Child sync")?.start).toHaveBeenCalledTimes(1);
    expect(loggers.get("Child async")?.done).toHaveBeenCalledTimes(1);
  });

  it("temporarily mutes the DI logger when using the default render mode at the root level", async () => {
    mockTaskLoggers();
    const ctx = DITest.createDIContext();
    const diLogger = ctx.logger as any;
    const originalLevel = diLogger.level;
    diLogger.level = "info";
    const observedLevels: string[] = [];

    await runInContext(ctx, () =>
      tasks(
        [
          {
            title: "Muted task",
            task: () => {
              observedLevels.push(getLevelLabel(context().logger.level));
            }
          }
        ],
        {}
      )
    );

    expect(observedLevels).toEqual(["ERROR"]);
    expect(getLevelLabel(diLogger.level)).toBe("INFO");
    diLogger.level = originalLevel;
  });

  it("keeps the DI logger level unchanged when render mode is raw", async () => {
    mockTaskLoggers();
    const ctx = DITest.createDIContext();
    const diLogger = ctx.logger as any;
    const originalLevel = diLogger.level;
    diLogger.level = "warn";
    const observedLevels: string[] = [];

    await runInContext(ctx, () =>
      tasks(
        [
          {
            title: "Raw mode task",
            task: () => {
              observedLevels.push(getLevelLabel(context().logger.level));
            }
          }
        ],
        {
          renderMode: "raw"
        }
      )
    );

    expect(observedLevels).toEqual(["WARN"]);
    expect(getLevelLabel(diLogger.level)).toBe("WARN");
    diLogger.level = originalLevel;
  });
});

describe("concat()", () => {
  it("merges task arrays while ignoring empty entries", async () => {
    const taskA: Task = {title: "A", task: vi.fn()};
    const taskB: Task = {title: "B", task: vi.fn()};
    const taskC: Task = {title: "C", task: vi.fn()};

    const result = await concat([taskA], undefined, [], [taskB, taskC]);

    expect(result).toEqual([taskA, taskB, taskC]);
  });
});
