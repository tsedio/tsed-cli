import {type ListrBaseClassOptions, type ListrContext, type ListrTask} from "listr2";

export interface TaskOptions<Ctx = ListrContext> extends ListrBaseClassOptions<Ctx> {
  concurrent?: boolean | number;
  verbose?: boolean;
  bindLogger?: boolean;
}

export type Task = ListrTask<any, any>;
export type Tasks = Task[];
