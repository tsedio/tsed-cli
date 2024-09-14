import {StoreSet, useDecorators} from "@tsed/core";
import {Injectable} from "@tsed/di";

import {CommandStoreKeys} from "../domains/CommandStoreKeys";
import {CommandParameters} from "../interfaces/CommandParameters";

export function Command(options: CommandParameters): ClassDecorator {
  return useDecorators(Injectable({type: "command"}), StoreSet(CommandStoreKeys.COMMAND, options)) as any;
}
