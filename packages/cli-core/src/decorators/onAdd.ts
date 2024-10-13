import {CommandStoreKeys} from "../domains/CommandStoreKeys.js";
import {On} from "./on.js";

export function OnAdd(cliPlugin: string): MethodDecorator {
  return On(CommandStoreKeys.ADD, cliPlugin);
}
