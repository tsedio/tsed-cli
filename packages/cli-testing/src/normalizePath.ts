import {isString} from "@tsed/core";

export function normalizePath(item: any) {
  if (isString(item)) {
    return require("normalize-path")(item);
  }

  return item.map(normalizePath);
}
