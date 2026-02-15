import type {Task} from "@tsed/cli-core";

import type {InitCmdContext} from "./InitCmdOptions.js";

export interface AlterInitSubTasks {
  $alterInitSubTasks(tasks: Task[], data: InitCmdContext): Task[] | Promise<Task[]>;
}
