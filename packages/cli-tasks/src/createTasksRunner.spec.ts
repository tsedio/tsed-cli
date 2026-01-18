import {DefaultRenderer, VerboseRenderer} from "listr2";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";

import {createSubTasks, createTaskRunnerOptions} from "./createTasksRunner.js";

const ORIGINAL_ENV = {...process.env};

afterEach(() => {
  process.env = {...ORIGINAL_ENV};
});

beforeEach(() => {
  delete process.env.CI;
  process.env.NODE_ENV = ORIGINAL_ENV.NODE_ENV;
});

describe("createTaskRunnerOptions", () => {
  it("prefers verbose renderer when verbose flag is set", () => {
    const options = createTaskRunnerOptions({verbose: true});

    expect(options.renderer).toBe(VerboseRenderer);
  });

  it("falls back to default renderer without verbose flag", () => {
    const options = createTaskRunnerOptions();

    expect(options.renderer).toBe(DefaultRenderer);
  });

  it("binds provided logger to verbose renderer", () => {
    const info = vi.fn();
    const error = vi.fn();
    const options = createTaskRunnerOptions({verbose: true, logger: {info, error}});

    const adapter = options.rendererOptions?.logger as any;

    adapter.log("FAILED", "broken");
    adapter.log("DATA", "message");

    expect(error).toHaveBeenCalledWith("[FAILED]", "broken");
    expect(info).toHaveBeenCalledWith("[DATA]", "message");
  });

  it("marks renderer silent inside test env", () => {
    process.env.NODE_ENV = "test";

    const options = createTaskRunnerOptions();

    expect(options.silentRendererCondition).toBe(true);
  });
});

describe("createSubTasks", () => {
  it("resolves task factories before delegating to Listr", async () => {
    const subTaskFactory = createSubTasks(async () => [{title: "demo", task: () => undefined}], {
      verbose: true
    });
    const newListr = vi.fn();

    await subTaskFactory({}, {newListr} as any);

    expect(newListr).toHaveBeenCalledTimes(1);
    const [, options] = newListr.mock.calls[0];
    expect(options.renderer).toBe(VerboseRenderer);
  });
});
