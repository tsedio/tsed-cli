import * as Listr from "listr";

export function createTasksRunner(tasks: any[], ctx: {verbose: boolean}) {
  const renderer = process.env.NODE_ENV === "test" ? "silent" : !ctx.verbose ? "default" : "verbose";

  return new Listr(tasks, {concurrent: false, renderer}).run(ctx);
}
