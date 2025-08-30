import type {Task} from "@tsed/cli-core";

import type {AlterGenerateTasks} from "./AlterGenerateTasks.js";
import type {AlterInitSubTasks} from "./AlterInitSubTasks.js";
import type {AlterPackageJson} from "./AlterPackageJson.js";
import type {AlterProjectFiles} from "./AlterProjectFiles.js";
import type {AlterRenderFiles} from "./AlterRenderFiles.js";
import type {InitCmdContext} from "./InitCmdOptions.js";

export interface CliCommandHooks
  extends Partial<AlterInitSubTasks & AlterPackageJson & AlterRenderFiles & AlterProjectFiles & AlterGenerateTasks> {
  $alterInitPostInstallTasks?(tasks: Task[], data: InitCmdContext): Task[] | Promise<Task[]>;
  $alterGeneratePostInstallTasks?(tasks: Task[], data: InitCmdContext): Task[] | Promise<Task[]>;
}
