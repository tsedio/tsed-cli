import {ListrContext, ListrOptions, ListrTask} from "listr2";

export interface TaskOptions<Ctx = ListrContext> extends ListrOptions<Ctx> {
  concurrent?: boolean | number;
  verbose?: boolean;
}

export type Task = ListrTask<any, any>;
export type Tasks = Task[];
