import {CommandStoreKeys} from "../domains/CommandStoreKeys.js";
import {On} from "./on.js";

export function OnPrompt(cmdName: string): MethodDecorator {
  return On(CommandStoreKeys.PROMPT_HOOKS, cmdName);
}
