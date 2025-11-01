import {CliService} from "@tsed/cli-core";
import {inject} from "@tsed/di";

export function exec(command: string, data: any) {
  return inject(CliService).getTasks(command, data);
}
