import {getValue} from "@tsed/core";
import type {TokenProvider} from "@tsed/di";

import {getCommandMetadata} from "./getCommandMetadata.js";

export function resolveConfiguration(settings: any) {
  const argv = getValue(settings, "argv", process.argv);
  const configResolvers = getValue(settings, "configResolvers", []);
  const commands = getValue(settings, "commands", []);

  const commandOpts = commands
    .map((token: TokenProvider) => getCommandMetadata(token))
    .find((commandOpts: any) => argv.includes(commandOpts.name));

  settings = {
    ...settings,
    commands,
    command: commandOpts || {},
    argv
  };

  configResolvers.map((resolver: (settings: any) => void) => resolver(settings));

  return settings;
}
