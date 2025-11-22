import {JsonSchema} from "@tsed/schema";
import {jsonSchemaToZod} from "json-schema-to-zod";
import {type AnyZodObject, z} from "zod";

function transform(schema: JsonSchema): Record<string, AnyZodObject> {
  return eval(`(z) => ${jsonSchemaToZod(schema.toJSON()).replace("z.object", "")}`)(z);
}

export function toZod(schema: unknown): Record<string, AnyZodObject> | undefined {
  return schema && schema instanceof JsonSchema ? transform(schema) : (schema as Record<string, AnyZodObject> | undefined);
}
