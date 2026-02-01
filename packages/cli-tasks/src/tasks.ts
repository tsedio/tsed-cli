import {isArray} from "@tsed/core/utils/isArray";
import {isBoolean} from "@tsed/core/utils/isBoolean";
import {isFunction} from "@tsed/core/utils/isFunction";
import {isObservable} from "@tsed/core/utils/isObservable";
import {isPromise} from "@tsed/core/utils/isPromise";
import {isString} from "@tsed/core/utils/isString";
import {context} from "@tsed/di";

import {TaskLogger, type TaskLoggerOptions} from "./domain/TaskLogger.js";
import type {Task} from "./interfaces/Task.js";

export interface TasksOptions {
  verbose?: TaskLoggerOptions["verbose"];
}

export async function tasks<T = any>(list: Task[], ctx: T & TasksOptions, parent?: TaskLogger) {
  const items = list.filter((task) => isEnabled(task));

  parent && (parent.max = items.length);

  for (let i = 0; i < items.length; i++) {
    const task = items[i];

    const taskLogger = TaskLogger.from({
      index: i,
      title: task.title,
      type: task.type,
      parent,
      verbose: ctx.verbose
    });

    try {
      if (!(await isExecutable(task, ctx))) {
        taskLogger.skip();
        continue;
      }

      taskLogger.start();

      context().set("TASK_LOGGER", taskLogger);

      const result = await resolveTaskResult(task.task(ctx, taskLogger), taskLogger);

      context().delete("TASK_LOGGER");

      if (isArray(result)) {
        await tasks(result, ctx, taskLogger);
      }

      taskLogger.done();
    } catch (er) {
      taskLogger.error(er);
      throw er;
    }
  }
}

function resolveTaskResult(result: any, logger: TaskLogger): Promise<any> | any {
  if (!result) {
    return result;
  }

  if (isPromise(result)) {
    return result;
  }

  if (isObservable(result)) {
    return new Promise((resolve, reject) => {
      let subscription: any;
      subscription = result.subscribe({
        next(value: unknown) {
          if (isString(value)) {
            logger.message(value);
          }
        },
        complete() {
          subscription?.unsubscribe?.();
          resolve(undefined);
        },
        error(err: any) {
          subscription?.unsubscribe?.();
          reject(err);
        }
      });
    });
  }

  return result;
}

export async function concat(...args: (Task[] | void | undefined)[]) {
  const tasks: Task[] = [];

  for (const arg of args) {
    if (isArray(arg)) {
      tasks.push(...arg);
    }
  }

  return tasks;
}

function isEnabled(item: Task<any>) {
  return isBoolean(item.enabled) ? item.enabled : true;
}

async function isExecutable<CTX = any>(item: Task, ctx: CTX): Promise<boolean> {
  if (isFunction(item.enabled)) {
    const isEnable = await item.enabled(ctx);

    if (!isEnable) {
      return false;
    }
  }

  if ("skip" in item) {
    const isSkipped = isFunction(item.skip) ? await item.skip(ctx) : item.skip;

    if (isSkipped) {
      return false;
    }
  }

  return true;
}

/**
 * @deprecated use tasks function instead
 */
export const createTasksRunner = tasks;
export const createSubTasks = tasks;
