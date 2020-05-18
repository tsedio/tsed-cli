import {CommandStoreKeys} from "../domains/CommandStoreKeys";
import {On} from "./on";

export function OnAdd(cliPlugin: string): MethodDecorator {
  return On(CommandStoreKeys.ADD, cliPlugin);
}
