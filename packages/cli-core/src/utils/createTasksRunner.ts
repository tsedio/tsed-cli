import {Listr, ListrTaskWrapper} from "listr2";
import type {TaskOptions, Tasks} from "../interfaces/Tasks";
import {isFunction} from "@tsed/core";

export function createTasks(tasks: Tasks, ctx: TaskOptions) {
  return new Listr(tasks as any, {
    ...ctx,
    rendererSilent: process.env.NODE_ENV === "test",
    disableColor: !(!ctx.verbose && !process.env.CI)
  });
}

export function createSubTasks(tasks: Tasks | ((ctx: any, task: any) => Tasks | Promise<Tasks>), opts: TaskOptions) {
  opts = {
    ...opts,
    rendererSilent: process.env.NODE_ENV === "test",
    disableColor: !(!opts.verbose && !process.env.CI)
  };

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
