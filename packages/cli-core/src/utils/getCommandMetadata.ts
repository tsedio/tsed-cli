import {Store} from "@tsed/core";
import type {TokenProvider} from "@tsed/di";

import type {CommandMetadata} from "../interfaces/CommandMetadata.js";
import type {CommandOptions} from "../interfaces/CommandOptions.js";

export function getCommandMetadata(token: TokenProvider): CommandMetadata {
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
  } = Store.from(token)?.get("command") as CommandOptions;

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
