import type {Type} from "@tsed/core";
import {type FactoryTokenProvider, injectable, type TokenProvider} from "@tsed/di";

import {CommandStoreKeys} from "../domains/CommandStoreKeys.js";
import type {CommandOptions} from "../interfaces/CommandOptions.js";
import type {CommandProvider} from "../interfaces/index.js";

export function command(options: CommandOptions) {
  if (!options.token) {
    return injectable<FactoryTokenProvider<CommandProvider>>(Symbol.for(`COMMAND_${options.name}`) as any)
      .type("command")
      .set(CommandStoreKeys.COMMAND, options)
      .factory(() => {
        return {
          ...options,
          $prompt: options.prompt,
          $exec: options.handler
        };
      });
  }

  return injectable<Type<CommandProvider>>(options.token).type("command").set(CommandStoreKeys.COMMAND, options);
}
