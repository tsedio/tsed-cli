import {applyDecorators, StoreSet} from "@tsed/core";
import {CommandStoreKeys} from "../domains/CommandStoreKeys";
import {ICommandParameters} from "../interfaces/ICommandParameters";
import {registerCommand} from "../registries/CommandRegistry";

export function Command(options: ICommandParameters): ClassDecorator {
  return applyDecorators(registerCommand, StoreSet(CommandStoreKeys.COMMAND, options)) as any;
}
