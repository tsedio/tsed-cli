import {ICommandArg} from "../interfaces/ICommandParameters";

export function createCommandSummary(name: string, args: {[arg: string]: ICommandArg}) {
  return Object.entries(args)
    .reduce((cmd, [arg, {required}]) => [...cmd, required ? `<${arg}>` : `[${arg}]`], [name])
    .join(" ");
}
