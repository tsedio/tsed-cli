import {injectable, type TokenProvider} from "@tsed/di";

import {CommandStoreKeys} from "../domains/CommandStoreKeys.js";
import type {CommandParameters} from "../interfaces/CommandParameters.js";

export function command(token: TokenProvider, options: CommandParameters): ReturnType<typeof injectable> {
  return injectable(token).type("command").set(CommandStoreKeys.COMMAND, options);
}
