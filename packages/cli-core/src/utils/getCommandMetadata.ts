import {Store, Type} from "@tsed/core";
import {CommandStoreKeys} from "../domains/CommandStoreKeys";
import {CommandParameters} from "../interfaces/CommandParameters";

export function getCommandMetadata(token: Type<any>) {
  const {name, alias, args = {}, allowUnknownOption, description, options = {}} = Store.from(token)?.get(
    CommandStoreKeys.COMMAND
  ) as CommandParameters;

  return {
    name,
    alias,
    args,
    description,
    options,
    allowUnknownOption: !!allowUnknownOption
  };
}
