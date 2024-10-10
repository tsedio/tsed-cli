import {CommandStoreKeys} from "../domains/CommandStoreKeys.js";
import {On} from "./on.js";

export function OnExec(cmdName: string): MethodDecorator {
  return On(CommandStoreKeys.EXEC_HOOKS, cmdName);
}
