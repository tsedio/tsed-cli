import {Type} from "@tsed/core";

export function parseOption(value: any, options: {type?: Type<any>; itemType?: Type<any>; customParser?: any}) {
  const {type, itemType, customParser} = options;

  if (type) {
    switch (type) {
      case String:
        value = String(value);
        break;
      case Boolean: // the flag is added
        return true;
      case Number:
        value = +value;
        break;
      case Array:
        value = value.split(",").map((value: string) => parseOption(value, {type: itemType, customParser}));
        break;
    }
  }

  if (options.customParser) {
    value = options.customParser(value);
  }

  return value;
}
