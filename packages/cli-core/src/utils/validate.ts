import type {JsonSchema} from "@tsed/schema";
import {Ajv} from "ajv";

const ajv = new Ajv({allErrors: true, strict: false});

export function validate<Value>(value: unknown, schema: JsonSchema<Value>) {
  const validate = ajv.compile(schema.toJSON());

  const result = validate(value);

  if (result) {
    const errors = (validate.errors || []).map((e) => ({
      path: e.instancePath || e.schemaPath,
      message: e.message,
      expected: (e.params && (e.params as any).type) || undefined
    }));

    return {
      isValid: false,
      errors: errors
    };
  }

  return {isValid: true, value: value as Value};
}
