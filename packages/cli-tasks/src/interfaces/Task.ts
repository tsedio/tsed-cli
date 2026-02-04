import type {Observable} from "rxjs";

import {TaskLogger, type TaskLoggerOptions} from "../domain/TaskLogger.js";

export type MaybePromise<T> = Promise<T> | T;

type TaskPredicate = MaybePromise<boolean | string | undefined>;

export interface Task<Ctx = any> {
  title: string;
  task: (ctx: Ctx, operation: TaskLogger) => MaybePromise<Task[] | unknown> | Observable<unknown>;
  skip?: boolean | string | ((ctx: Ctx) => TaskPredicate);
  enabled?: boolean | ((ctx: Ctx) => MaybePromise<boolean>);
  type?: TaskLoggerOptions["type"];
}
