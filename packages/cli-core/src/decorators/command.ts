import {applyDecorators, StoreSet} from "@tsed/core";
import {ICommandParameters} from "../interfaces/ICommandParameters";
import {registerCommand} from "../registries/CommandRegistry";

export function Command(options: ICommandParameters): ClassDecorator {
  return applyDecorators(registerCommand, StoreSet("command", options)) as any;
}
