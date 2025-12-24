import {command} from "../fn/command.js";
import type {BaseCommandOptions} from "../interfaces/CommandOptions.js";

export function Command<Input = any>(options: BaseCommandOptions<Input>): ClassDecorator {
  return (token) => {
    command({...options, token});
  };
}
