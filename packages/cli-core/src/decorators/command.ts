import {command} from "../fn/command.js";
import type {CommandParameters} from "../interfaces/CommandParameters.js";

export function Command(options: CommandParameters): ClassDecorator {
  return (token) => {
    command(token, options);
  };
}
