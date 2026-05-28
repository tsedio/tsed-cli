import {JsonSchema} from "@tsed/schema";
import {jsonSchemaToZod} from "json-schema-to-zod";
import {z, type ZodObject} from "zod";

function transform(schema: JsonSchema): ZodObject {
  return eval(`(z) => ${jsonSchemaToZod(schema.toJSON(), {zodVersion: 4})}`)(z);
}

export function toZod(schema: unknown): ZodObject | undefined {
  return schema && schema instanceof JsonSchema ? transform(schema) : (schema as ZodObject | undefined);
}
