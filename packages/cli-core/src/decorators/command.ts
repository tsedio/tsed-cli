import {StoreSet, useDecorators} from "@tsed/core";
import {Injectable} from "@tsed/di";

import {CommandStoreKeys} from "../domains/CommandStoreKeys.js";
import type {CommandParameters} from "../interfaces/CommandParameters.js";

export function Command(options: CommandParameters): ClassDecorator {
  return useDecorators(Injectable({type: "command"}), StoreSet(CommandStoreKeys.COMMAND, options)) as any;
}
