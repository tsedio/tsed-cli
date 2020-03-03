import {CommandStoreKeys} from "../domains/CommandStoreKeys";
import {On} from "./on";

export function OnPrompt(cmdName: string): MethodDecorator {
  return On(CommandStoreKeys.PROMPT_HOOKS, cmdName);
}
