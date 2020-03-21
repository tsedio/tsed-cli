import {Store} from "@tsed/core";
import {Type} from "@tsed/core/lib/interfaces";
import {CommandStoreKeys} from "../domains/CommandStoreKeys";
import {ICommandParameters} from "../interfaces/ICommandParameters";

export function getCommandMetadata(token: Type<any>) {
  const {name, alias, args = {}, description, options = {}} = Store.from(token)?.get(CommandStoreKeys.COMMAND) as ICommandParameters;

  return {
    name,
    alias,
    args,
    description,
    options
  };
}
