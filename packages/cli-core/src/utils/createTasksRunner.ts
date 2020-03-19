import * as Listr from "listr";

export function createTasksRunner(tasks: any[], ctx: {verbose: boolean}) {
  return new Listr(tasks, {concurrent: false, renderer: !ctx.verbose ? "default" : "verbose"}).run(ctx);
}
