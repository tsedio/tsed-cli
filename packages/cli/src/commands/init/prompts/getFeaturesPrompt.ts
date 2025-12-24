import {cleanObject, isFunction} from "@tsed/core";

import type {InitOptions} from "../../../interfaces/index.js";
import {FeaturesMap, FeaturesPrompt} from "../config/FeaturesPrompt.js";

function mapChoices(item: any, options: Partial<InitOptions>) {
  return item.choices.map((choice: string) => {
    const {checked} = FeaturesMap[choice];

    return cleanObject({
      ...FeaturesMap[choice],
      value: choice,
      checked: isFunction(checked) ? checked(options) : checked
    });
  });
}

export function getFeaturesPrompt(runtimes: string[], availablePackageManagers: string[], options: Partial<InitOptions>) {
  return FeaturesPrompt(runtimes, availablePackageManagers).map((item: any, index) => {
    return cleanObject({
      ...item,
      choices: item.choices?.length ? mapChoices(item, options) : undefined
    });
  });
}
