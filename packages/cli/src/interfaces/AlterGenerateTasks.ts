import type {Task} from "@tsed/cli-core";

import type {GenerateCmdContext} from "./GenerateCmdContext.js";

export interface AlterGenerateTasks {
  $alterGenerateTasks(tasks: Task[], data: GenerateCmdContext): Task[] | Promise<Task[]>;
}
