import {isString} from "@tsed/core";
import {normalizePath as n} from "@tsed/normalize-path";

export function normalizePath(item: any) {
  if (isString(item)) {
    return n(item);
  }

  return item.map(normalizePath);
}
