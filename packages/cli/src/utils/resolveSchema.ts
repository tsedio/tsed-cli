import {JsonSchema} from "@tsed/schema";

export async function resolveSchema(schema?: JsonSchema) {
  if (!schema) {
    return undefined;
  }

  const result = Object.entries(schema.get("properties")).map(async ([key, value]) => {
    if (value instanceof JsonSchema && !value.get("x-choices")) {
      const fn = value.get("x-remote-choices");

      if (fn) {
        value.customKey("x-choices", await fn());
        value.customKey("x-remote-choices", undefined);
      }
    }
  });

  await Promise.all(result);

  return schema.toJSON({customKeys: true});
}
