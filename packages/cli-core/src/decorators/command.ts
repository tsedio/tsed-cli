import {useDecorators, StoreSet} from "@tsed/core";
import {CommandStoreKeys} from "../domains/CommandStoreKeys";
import {CommandParameters} from "../interfaces/CommandParameters";
import {registerCommand} from "../registries/CommandRegistry";

export function Command(options: CommandParameters): ClassDecorator {
  return useDecorators(registerCommand, StoreSet(CommandStoreKeys.COMMAND, options)) as any;
}
