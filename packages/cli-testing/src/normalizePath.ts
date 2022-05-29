import {isString} from "@tsed/core";
import normalize_path from "normalize-path";

export function normalizePath(item: any) {
  if (isString(item)) {
    return normalize_path(item);
  }

  return item.map(normalizePath);
}
