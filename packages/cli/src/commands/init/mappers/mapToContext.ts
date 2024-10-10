import {camelCase} from "change-case";

import type {InitCmdContext} from "../interfaces/InitCmdContext.js";
import {mapUniqFeatures} from "./mapUniqFeatures.js";

export function mapToContext(options: any): InitCmdContext {
  options = mapUniqFeatures(options);

  options.features.forEach((feature: string) => {
    feature.split(":").forEach((type) => {
      options[camelCase(type)] = true;
    });
  });

  return options;
}
