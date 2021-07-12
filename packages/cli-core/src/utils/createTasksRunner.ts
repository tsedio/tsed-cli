import Listr from "listr";

export function createTasks(tasks: any[], ctx: {concurrent?: boolean | number; verbose: boolean}) {
  const renderer = process.env.NODE_ENV === "test" ? "silent" : !ctx.verbose && !process.env.CI ? "default" : "verbose";

  return new Listr(tasks, {concurrent: ctx.concurrent, renderer});
}

export function createTasksRunner(tasks: any[], ctx: {verbose: boolean}) {
  return createTasks(tasks, ctx).run(ctx);
}
