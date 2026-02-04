import type {TasksOptions} from "@tsed/cli-tasks";

declare global {
  namespace TsED {
    interface InitialCommandData {}
  }
}

export interface CommandData extends TsED.InitialCommandData {
  commandName?: string;
  verbose?: TasksOptions["verbose"];
  renderMode?: TasksOptions["renderMode"];
  rawArgs?: string[];
  [key: string]: any;
}
