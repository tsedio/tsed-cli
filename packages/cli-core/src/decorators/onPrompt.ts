import {CommandStoreKeys} from "../domains/CommandStoreKeys";
import {On} from "./on";

export function OnExec(cmdName: string): MethodDecorator {
  return On(CommandStoreKeys.EXEC_HOOKS, cmdName);
}
