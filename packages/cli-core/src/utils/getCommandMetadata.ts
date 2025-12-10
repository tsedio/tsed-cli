import {isArrowFn, Store} from "@tsed/core";
import type {TokenProvider} from "@tsed/di";
import type {JsonSchema} from "@tsed/schema";

import type {CommandMetadata} from "../interfaces/CommandMetadata.js";
import type {CommandArg, CommandOptions, CommandOpts} from "../interfaces/CommandOptions.js";

export function getCommandMetadata(token: TokenProvider): CommandMetadata {
  const {
    name,
    alias,
    args = {},
    allowUnknownOption,
    description,
    options = {},
    enableFeatures,
    disableReadUpPkg,
    inputSchema,
    bindLogger = true,
    ...opts
  } = Store.from(token)?.get("command") as CommandOptions<any>;

  if (inputSchema) {
    const schema = isArrowFn(inputSchema) ? inputSchema() : inputSchema;

    Object.entries(schema.get<JsonSchema[]>("properties") || {})?.forEach(([propertyKey, propertySchema]) => {
      const base = {
        type: propertySchema.getTarget(),
        itemType: propertySchema.isCollection ? propertySchema.get("items").getTarget() : undefined,
        description: propertySchema.get<string>("description") || "",
        defaultValue: propertySchema.get<string>("default"),
        required: schema.isRequired(propertyKey)
      };

      const opt = propertySchema.get<string>("opt");

      if (opt) {
        options[opt] = {
          ...base,
          customParser: schema.get("custom-parser")
        } satisfies CommandOpts;
      }

      const arg = propertySchema.get<string>("arg");

      if (arg) {
        args[arg] = base satisfies CommandArg;
      }
    });
  }

  return {
    name,
    inputSchema,
    alias,
    args,
    description,
    options,
    allowUnknownOption: !!allowUnknownOption,
    enableFeatures: enableFeatures || [],
    disableReadUpPkg: !!disableReadUpPkg,
    bindLogger,
    ...opts
  };
}
