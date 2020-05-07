import {CommandStoreKeys} from "../domains/CommandStoreKeys";
import {On} from "./on";

export function OnPostInstall(cmdName: string): MethodDecorator {
  return On(CommandStoreKeys.POST_INSTALL_HOOKS, cmdName);
}
