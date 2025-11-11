import type {DefineTemplateOptions} from "./defineTemplate.js";

export const summarizeSchema = (tpl: DefineTemplateOptions) => {
  if (!tpl.schema) {
    return undefined;
  }

  const json = tpl.schema.toJSON();

  if (!json.properties) {
    return {};
  }

  const properties: Record<string, any> = {};

  for (const [k, v] of Object.entries(json.properties as any)) {
    const vv = v as any;

    properties[k] = {
      type: Array.isArray(vv.type) ? vv.type.join("|") : vv.type,
      enum: vv.enum,
      pattern: vv.pattern,
      description: vv.description
    };
  }

  const required = json.required || [];

  return {
    required: required.length ? required : undefined,
    properties: Object.keys(properties).length ? properties : undefined
  };
};
