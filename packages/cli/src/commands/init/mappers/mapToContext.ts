import {camelCase} from "change-case";

import {InitCmdContext} from "../interfaces/InitCmdContext";
import {mapUniqFeatures} from "./mapUniqFeatures";

export function mapToContext(options: any): InitCmdContext {
  options = mapUniqFeatures(options);

  options.features.forEach((feature: string) => {
    feature.split(":").forEach((type) => {
      options[camelCase(type)] = true;
    });
  });

  return options;
}
