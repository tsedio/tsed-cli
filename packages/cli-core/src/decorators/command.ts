import {command} from "../fn/command.js";
import type {CommandOptions} from "../interfaces/CommandOptions.js";

export function Command(options: CommandOptions): ClassDecorator {
  return (token) => {
    command({...options, token});
  };
}
