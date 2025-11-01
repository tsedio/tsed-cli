import {context} from "@tsed/di";

export function taskOutput(output: string) {
  const task = context().get("currentTask");
  if (task) {
    task.output = output;
  }
}
