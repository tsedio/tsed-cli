import {
  DefaultRenderer,
  Listr,
  type ListrBaseClassOptions,
  type ListrContext,
  ListrLogger,
  type ListrTask,
  type ListrTaskWrapper,
  type LoggerFieldOptions,
  VerboseRenderer
} from "listr2";

export interface TaskLogger {
  info(...args: any[]): void;
  error(...args: any[]): void;
}

export interface TaskRunnerOptions<Ctx = ListrContext> extends ListrBaseClassOptions<Ctx> {
  concurrent?: boolean | number;
  verbose?: boolean;
  bindLogger?: boolean;
  logger?: TaskLogger;
}

export type Task = ListrTask<any, any, any>;
export type Tasks = Task[];
export type TaskOptions<Ctx = ListrContext> = TaskRunnerOptions<Ctx>;

class TaskLoggerAdapter extends ListrLogger {
  constructor(private readonly taskLogger: TaskLogger) {
    super();
  }

  log(level: string, message: string | any[], options?: LoggerFieldOptions) {
    if (["FAILED"].includes(level)) {
      this.taskLogger.error(`[${level}]`, message);
    } else {
      this.taskLogger.info(`[${level}]`, message);
    }
  }
}

export function createTaskRunnerOptions(options: TaskRunnerOptions = {}) {
  const {bindLogger = true, logger, verbose, ...listrOptions} = options;
  const useVerboseRenderer = Boolean(verbose || process.env.CI);

  return {
    ...listrOptions,
    silentRendererCondition: process.env.NODE_ENV === "test",
    renderer: useVerboseRenderer ? VerboseRenderer : DefaultRenderer,
    rendererOptions: useVerboseRenderer && bindLogger && logger ? {logger: new TaskLoggerAdapter(logger) as never} : undefined
  };
}

export function createTasks(tasks: Tasks, options: TaskRunnerOptions = {}) {
  return new Listr(tasks, createTaskRunnerOptions(options));
}

export function createSubTasks(
  tasks: Tasks | ((ctx: any, task: ListrTaskWrapper<any, any, any>) => Tasks | Promise<Tasks>),
  options: TaskRunnerOptions = {}
) {
  return async (ctx: any, task: ListrTaskWrapper<any, any, any>) => {
    const resolvedTasks = typeof tasks === "function" ? await tasks(ctx, task) : tasks;

    return task.newListr(resolvedTasks, createTaskRunnerOptions(options) as never);
  };
}

export function createTasksRunner(tasks: Tasks, ctx: TaskRunnerOptions = {}) {
  return createTasks(tasks, ctx).run(ctx as any);
}
