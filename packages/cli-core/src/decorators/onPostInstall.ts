import {CommandStoreKeys} from "../domains/CommandStoreKeys.js";
import {On} from "./on.js";

export function OnPostInstall(cmdName: string): MethodDecorator {
  return On(CommandStoreKeys.POST_INSTALL_HOOKS, cmdName);
}
