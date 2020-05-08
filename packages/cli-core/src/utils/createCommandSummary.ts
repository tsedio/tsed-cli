import {CommandArg} from "../interfaces/CommandParameters";

export function createCommandSummary(name: string, args: {[arg: string]: CommandArg}) {
  return Object.entries(args)
    .reduce((cmd, [arg, {required}]) => [...cmd, required ? `<${arg}>` : `[${arg}]`], [name])
    .join(" ");
}
