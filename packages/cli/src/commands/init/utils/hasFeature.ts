import {getValue} from "@tsed/core";

export function hasValue(expression: string, value: string | string[]) {
  return (ctx: any) => [].concat(value as any).includes(getValue(expression, ctx)!);
}

export function hasFeature(feature: string) {
  return (ctx: any): boolean => !!ctx.features.find((item: string) => item === feature);
}

export function hasValuePremium() {
  return (ctx: any): boolean => !!ctx.features.find((item: string) => item.endsWith(":premium"));
}
