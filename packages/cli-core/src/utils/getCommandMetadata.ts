import {Store, Type} from "@tsed/core";
import {CommandStoreKeys} from "../domains/CommandStoreKeys";
import {CommandParameters} from "../interfaces/CommandParameters";
import {CommandMetadata} from "../interfaces/CommandMetadata";

export function getCommandMetadata(token: Type<any>): CommandMetadata {
  const {
    name,
    alias,
    args = {},
    allowUnknownOption,
    description,
    options = {},
    enableFeatures,
    disableReadUpPkg,
    bindLogger = true,
    ...opts
  } = Store.from(token)?.get(CommandStoreKeys.COMMAND) as CommandParameters;

  return {
    name,
    alias,
    args,
    description,
    options,
    allowUnknownOption: !!allowUnknownOption,
    enableFeatures: enableFeatures || [],
    disableReadUpPkg: !!disableReadUpPkg,
    bindLogger,
    ...opts
  };
}
