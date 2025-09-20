import {inject} from "@tsed/cli-core";
import {isString} from "@tsed/core";
import {pascalCase} from "change-case";

import type {GenerateCmdContext} from "../../interfaces/GenerateCmdContext.js";
import {RoutePipe} from "../../pipes/RoutePipe.js";
import {CliProjectService} from "../CliProjectService.js";

export function addContextMethods(context: GenerateCmdContext) {
  const getName = (state: {type?: string; name?: string}) =>
    context.name || pascalCase(state.name || context.name || state.type || context.type || "");

  return {
    getName,
    getRoute: (state: {type?: string; name?: string}) => {
      return inject(RoutePipe).transform(isString(state) ? state : getName!(state));
    },
    getDirectories: (dir: string) => {
      return inject(CliProjectService).getDirectories(dir);
    }
  };
}
