import {contextLogger, DITest, runInContext} from "@tsed/di";
import type {MockInstance} from "vitest";
import {afterEach, beforeAll, beforeEach, describe, expect, it, vi} from "vitest";

import type {TaskLogger as TaskLoggerClass} from "./TaskLogger.js";

type ProgressStub = {
  start: ReturnType<typeof vi.fn>;
  stop: ReturnType<typeof vi.fn>;
  advance: ReturnType<typeof vi.fn>;
};

type SpinnerStub = {
  start: ReturnType<typeof vi.fn>;
  stop: ReturnType<typeof vi.fn>;
  message: ReturnType<typeof vi.fn>;
};

type TaskLogStub = {
  title: string;
  info: ReturnType<typeof vi.fn>;
  warn: ReturnType<typeof vi.fn>;
  error: ReturnType<typeof vi.fn>;
  message: ReturnType<typeof vi.fn>;
  success: ReturnType<typeof vi.fn>;
  group: ReturnType<typeof vi.fn>;
};

type LogMock = {
  info: ReturnType<typeof vi.fn>;
  warn: ReturnType<typeof vi.fn>;
  error: ReturnType<typeof vi.fn>;
  message: ReturnType<typeof vi.fn>;
  success: ReturnType<typeof vi.fn>;
};

type ClackMocks = {
  logMock: LogMock;
  progressInstances: ProgressStub[];
  spinnerInstances: SpinnerStub[];
  taskLogInstances: TaskLogStub[];
  progressMock: ReturnType<typeof vi.fn>;
  spinnerMock: ReturnType<typeof vi.fn>;
  taskLogMock: ReturnType<typeof vi.fn>;
};

const clack = vi.hoisted(() => {
  const logMock: LogMock = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    message: vi.fn(),
    success: vi.fn()
  };

  const progressInstances: ProgressStub[] = [];
  const spinnerInstances: SpinnerStub[] = [];
  const taskLogInstances: TaskLogStub[] = [];

  const createProgressInstance = () => {
    const instance: ProgressStub = {
      start: vi.fn(),
      stop: vi.fn(),
      advance: vi.fn()
    };

    progressInstances.push(instance);
    return instance;
  };

  const createSpinnerInstance = () => {
    const instance: SpinnerStub = {
      start: vi.fn(),
      stop: vi.fn(),
      message: vi.fn()
    };

    spinnerInstances.push(instance);
    return instance;
  };

  const createTaskLogInstance = (title: string): TaskLogStub => {
    const instance: TaskLogStub = {
      title,
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      message: vi.fn(),
      success: vi.fn(),
      group: vi.fn()
    };

    instance.group.mockImplementation((childTitle: string) => createTaskLogInstance(childTitle));
    taskLogInstances.push(instance);

    return instance;
  };

  return {
    logMock,
    progressInstances,
    spinnerInstances,
    taskLogInstances,
    progressMock: vi.fn(() => createProgressInstance()),
    spinnerMock: vi.fn(() => createSpinnerInstance()),
    taskLogMock: vi.fn(({title}: {title: string}) => createTaskLogInstance(title))
  };
}) as ClackMocks;

vi.mock("@clack/prompts", () => ({
  log: clack.logMock,
  progress: clack.progressMock,
  spinner: clack.spinnerMock,
  taskLog: clack.taskLogMock
}));

const {logMock, progressInstances, spinnerInstances, taskLogInstances} = clack;

describe("TaskLogger", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    progressInstances.length = 0;
    spinnerInstances.length = 0;
    taskLogInstances.length = 0;

    return DITest.create({
      env: "test"
    });
  });

  afterEach(() => DITest.reset());

  it("logs start/done using the default log prompt", () => {
    const logger = TaskLogger.from({
      title: "Build project",
      index: 0
    });

    expect(logger.type).toBe("log");

    logger.start();
    logger.done();

    expect(logMock.info).toHaveBeenCalledWith("Build project...");
    expect(logMock.success).toHaveBeenCalledWith("Build project completed");
  });

  it("emits message when the title changes", () => {
    const logger = TaskLogger.from({
      title: "Initial",
      index: 0
    });

    logger.title = "Updated title";

    expect(logMock.message).toHaveBeenCalledWith("Updated title");
  });

  it("advances the parent progress bar for child progress tasks", () => {
    const parent = new TaskLogger({
      title: "Install dependencies",
      index: 0,
      type: "progress"
    });
    parent.max = 4;

    const child = TaskLogger.from({
      title: "Install packages",
      index: 1,
      parent
    });

    child.start();

    expect(progressInstances[0]?.advance).toHaveBeenCalledWith(25, "Install packages");
  });

  it("returns the spinner parent when nested spinner tasks are requested", () => {
    const spinnerParent = new TaskLogger({
      title: "Loading spinner",
      index: 0,
      type: "spinner"
    });

    const nested = TaskLogger.from({
      title: "Nested spinner",
      index: 1,
      parent: spinnerParent
    });

    expect(nested).toBe(spinnerParent);
  });

  it("marks taskLog children as skipped via error logger", () => {
    const parent = new TaskLogger({
      title: "Parent log",
      index: 0,
      type: "taskLog"
    });

    const child = TaskLogger.from({
      title: "Child log",
      index: 1,
      parent
    });

    child.skip();

    const childLogger = taskLogInstances.find((instance) => instance.title === "Child log");
    expect(childLogger?.error).toHaveBeenCalledWith("Child log skipped...");
  });

  it("creates grouped loggers for nested taskLog hierarchies", () => {
    const root = new TaskLogger({
      title: "Root task",
      index: 0,
      type: "taskLog"
    });
    const child = TaskLogger.from({
      title: "Child task",
      index: 1,
      parent: root
    });

    TaskLogger.from({
      title: "Grandchild task",
      index: 2,
      parent: child
    });

    const childLogger = taskLogInstances.find((instance) => instance.title === "Child task");
    const grandChildLogger = taskLogInstances.find((instance) => instance.title === "Grandchild task");

    expect(childLogger?.group).toHaveBeenCalledWith("Grandchild task");
    expect(grandChildLogger).toBeDefined();
  });

  it("routes verbose output through the context logger", async () => {
    const ctx = DITest.createDIContext();
    let infoSpy!: MockInstance;
    let warnSpy!: MockInstance;
    let errorSpy!: MockInstance;

    await runInContext(ctx, () => {
      const scopedLogger = contextLogger();
      infoSpy = vi.spyOn(scopedLogger, "info");
      warnSpy = vi.spyOn(scopedLogger, "warn");
      errorSpy = vi.spyOn(scopedLogger, "error");

      const logger = new TaskLogger({
        title: "Verbose task",
        index: 0,
        type: "log",
        verbose: true
      });

      logger.message("hello");
      logger.warn("be careful");
      logger.error("boom");
      logger.report("report payload");

      return logger;
    });

    expect(infoSpy).toHaveBeenCalledWith({
      state: "MSG",
      title: "Verbose task",
      message: "Verbose task - hello"
    });
    expect(warnSpy).toHaveBeenCalledWith({
      title: "Verbose task",
      message: "Verbose task - be careful"
    });
    expect(errorSpy).toHaveBeenCalledWith({
      title: "Verbose task",
      message: "Verbose task - boom"
    });
    expect(infoSpy).toHaveBeenCalledWith({
      title: "Verbose task",
      message: "report payload"
    });
  });

  it("writes raw output through info fallback", () => {
    const logger = TaskLogger.from({
      title: "Output task",
      index: 0
    });

    logger.output = "custom message";

    expect(logMock.info).toHaveBeenCalledWith("custom message");
  });
});
let TaskLogger: typeof TaskLoggerClass;

beforeAll(async () => {
  ({TaskLogger} = await import("./TaskLogger.js"));
});
