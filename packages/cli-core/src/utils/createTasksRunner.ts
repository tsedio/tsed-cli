// @ts-ignore
import {isFunction} from "@tsed/core";
import {Listr, ListrTaskWrapper, Logger} from "listr2";

import type {TaskOptions, Tasks} from "../interfaces/Tasks.js";
import {getLogger} from "./createInjector.js";

class CustomLogger extends Logger {
  fail(message: string) {
    getLogger()?.error("[FAIL]", message);
  }

  skip(message: string) {
    getLogger()?.info("[SKIP]", message);
  }

  success(message: string) {
    getLogger()?.info("[SUCCESS]", message);
  }

  data(message: string) {
    getLogger()?.info("[DATA]", message);
  }

  start(message: string) {
    getLogger()?.info("[START]", message);
  }

  title(message: string) {
    getLogger()?.info("[TITLE]", message);
  }

  retry(message: string) {
    getLogger()?.info("[RETRY]", message);
  }

  rollback(message: string) {
    getLogger()?.info("[ROLLBACK]", message);
  }
}

function getOptions({bindLogger = true, ...ctx}: TaskOptions): any {
  const useRawRenderer = !(!ctx.verbose && !process.env.CI);
  const rendererOptions =
    useRawRenderer && bindLogger
      ? {
          logger: CustomLogger
        }
      : {};
  return {
    ...ctx,
    rendererSilent: process.env.NODE_ENV === "test",
    rendererFallback: useRawRenderer,
    renderer: useRawRenderer ? "verbose" : "default",
    nonTTYRendererOptions: rendererOptions,
    rendererOptions
  };
}

export function createTasks(tasks: Tasks, ctx: TaskOptions) {
  return new Listr(tasks as any, getOptions(ctx));
}

export function createSubTasks(tasks: Tasks | ((ctx: any, task: any) => Tasks | Promise<Tasks>), opts: TaskOptions) {
  opts = getOptions(opts);

  return async (ctx: any, task: ListrTaskWrapper<any, any>) => {
    if (isFunction(tasks)) {
      tasks = await tasks(ctx, task);
    }

    return task.newListr(tasks, opts);
  };
}

export function createTasksRunner(tasks: Tasks, ctx: TaskOptions) {
  return createTasks(tasks, ctx).run(ctx as any);
}
