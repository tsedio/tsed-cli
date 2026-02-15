import {camelCase} from "change-case";

import type {InitOptions} from "../../../interfaces/InitCmdOptions.js";
import {mapUniqFeatures} from "./mapUniqFeatures.js";

export function mapToContext(options: any): InitOptions {
  options = mapUniqFeatures(options);

  options.features.forEach((feature: string) => {
    const [base, type] = feature.split(":");

    if (feature?.endsWith(":premium")) {
      feature = feature.replace(":premium", "");
      options.premium = true;
    }

    options[camelCase(base)] = true;
    type && (options[camelCase(type)] = true);
    feature && (options[camelCase(feature)] = true);
  });

  return options;
}
