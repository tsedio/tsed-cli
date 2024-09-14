import {isArray, isClass, Type} from "@tsed/core";

import {CommandArg} from "../interfaces/CommandParameters";

function mapValue(value: any, {type, itemType}: {type?: Type<any>; itemType?: Type<any>}) {
  if (!value) {
    return value;
  }
  switch (type) {
    case String:
      value = String(value);
      break;
    case Number:
      value = parseFloat(value);
      break;
    case Boolean:
      value = value === "true";
      break;
    case Array:
      value = String(value)
        .split(",")
        .map((value) => mapValue(value, {type: itemType}));
      break;
  }

  return value;
}

export function mapCommanderArgs(args: {[arg: string]: CommandArg}, commandArgs: any[]): any {
  commandArgs = commandArgs.filter((arg) => !isClass(arg)).filter((arg) => !isArray(arg));
  let index = 0;

  return Object.entries(args).reduce((options, [arg, {defaultValue, type, itemType}]) => {
    const value = commandArgs[index] || defaultValue;

    index++;

    return {
      ...options,
      [arg]: mapValue(value, {type, itemType})
    };
  }, {});
}
