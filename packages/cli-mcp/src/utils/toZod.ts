import {JsonSchema} from "@tsed/schema";
import {jsonSchemaToZod} from "json-schema-to-zod";
import {type AnyZodObject, z} from "zod";

function transform(schema: JsonSchema): AnyZodObject {
  return eval(`(z) => ${jsonSchemaToZod(schema.toJSON()).replace("z.object", "")}`)(z);
}

export function toZod(schema: unknown): AnyZodObject | undefined {
  return schema && schema instanceof JsonSchema ? transform(schema) : (schema as AnyZodObject | undefined);
}
