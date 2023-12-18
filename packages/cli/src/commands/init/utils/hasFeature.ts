import {getValue} from "@tsed/core";

export function hasValue(expression: string, value: any) {
  return (ctx: any) => getValue(expression, ctx) === value;
}

export function hasValues(expression: string, values: string[]) {
  return (ctx: any) => values.includes(getValue(expression, ctx)!);
}

export function hasFeature(feature: string) {
  return (ctx: any): boolean => !!ctx.features.find((item: string) => item === feature);
}
