import {context, ContextLogger, contextLogger} from "@tsed/di";

export function taskLogger(): ContextLogger {
  return (context().get("TASK_LOGGER") as ContextLogger | undefined) || contextLogger();
}
