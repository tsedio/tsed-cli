// @ts-ignore
import {isFunction} from "@tsed/core";
import {DefaultRenderer, Listr, ListrLogger, type ListrTaskWrapper, type LoggerFieldOptions, VerboseRenderer} from "listr2";

import type {TaskOptions, Tasks} from "../interfaces/Tasks.js";
import {getLogger} from "./createInjector.js";

class CustomLogger extends ListrLogger {
  log(level: string, message: string | any[], options?: LoggerFieldOptions) {
    if (["FAILED"].includes(level)) {
      getLogger()?.error(`[${level}]`, message);
    } else {
      getLogger()?.info(`[${level}]`, message);
    }
  }
}

function getOptions({bindLogger = true, ...ctx}: TaskOptions) {
  const useRawRenderer = !(!ctx.verbose && !process.env.CI);

  return {
    silentRendererCondition: process.env.NODE_ENV === "test",
    renderer: useRawRenderer ? VerboseRenderer : DefaultRenderer,
    rendererOptions:
      useRawRenderer && bindLogger
        ? {
            logger: CustomLogger as never
          }
        : undefined
  };
}

export function createTasks(tasks: Tasks, ctx: TaskOptions) {
  return new Listr(tasks, getOptions(ctx));
}

export function createSubTasks(tasks: Tasks | ((ctx: any, task: any) => Tasks | Promise<Tasks>), opts: TaskOptions) {
  return async (ctx: any, task: ListrTaskWrapper<any, any, any>) => {
    if (isFunction(tasks)) {
      tasks = await tasks(ctx, task);
    }

    return task.newListr(tasks, getOptions(opts));
  };
}

export function createTasksRunner(tasks: Tasks, ctx: TaskOptions) {
  return createTasks(tasks, ctx).run(ctx as any);
}
