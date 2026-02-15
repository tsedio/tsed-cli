import {defineResource} from "@tsed/cli-mcp";

import {InitMCPSchema} from "../schema/InitMCPSchema.js";

type JsonObject = Record<string, any>;
type ChoiceEntry = {label?: string; value?: string; items?: ChoiceEntry[]};

function stripCliFlags(payload: unknown): unknown {
  if (Array.isArray(payload)) {
    return payload.map(stripCliFlags);
  }

  if (payload && typeof payload === "object") {
    return Object.entries(payload).reduce<JsonObject>((acc, [key, value]) => {
      if (key === "x-opt") {
        return acc;
      }

      acc[key] = stripCliFlags(value);
      return acc;
    }, {});
  }

  return payload;
}

function buildSection(key: string, property: JsonObject) {
  const title = property["x-label"] || "";

  if (!title) {
    return "";
  }

  const choices = (property["x-choices"] as ChoiceEntry[]) || property["items"]?.["x-choices"] || property["enum"] || [];

  if (!choices.length) {
    return `${title}?\n`;
  }

  const lines = [title + (property.type === "array" ? "(multiple choices possible)" : "")];

  const loop = (items: ChoiceEntry[] | undefined, indent: number) => {
    if (!Array.isArray(items)) {
      return;
    }

    for (const entry of items) {
      const label = entry.label || entry.value;

      if (!label) {
        continue;
      }

      lines.push(`${" ".repeat(indent)}- ${label}`);

      if (entry.items?.length) {
        loop(entry.items, indent + 4);
      }
    }
  };

  loop(choices, 4);
  lines.push("");

  const xSchemaPath = `#/schema.properties.${key}`;

  if ((property["x-choices"] as ChoiceEntry[]) || property["items"]?.["x-choices"]) {
    const xChoicesPath = property.type === "array" ? `${xSchemaPath}.items.x-choices` : `${xSchemaPath}.x-choices`;

    lines.push(`> LLM note only: labels/values mapping is here \`${xChoicesPath}\` and schema is here \`${xSchemaPath}\``);
    lines.push("");
  } else {
    lines.push(`> LLM note only: schema is here \`${xSchemaPath}\``);
    lines.push("");
  }

  return lines.join("\n");
}

function buildInstructions(schema: JsonObject) {
  const properties = schema.properties || {};

  return Object.entries(properties)
    .map(([key, definition], index) => {
      const property = definition as JsonObject;
      const result = buildSection(key, property);

      return result ? `${index + 1}) ${result}` : property;
    })
    .join("\n");
}

export const initOptionsResource = defineResource({
  name: "init-options",
  uri: "tsed://init/options",
  title: "Inspect Ts.ED init options",
  description:
    "Returns curated Ts.ED init instructions plus the machine-readable schema so assistants can gather user preferences then call `init-project`. Show humans only the labels; use the provided mapping to translate back to enum values.",
  mimeType: "application/json",
  async handler(uri) {
    const rawSchema = InitMCPSchema().omit("cwd", "tsedVersion").toJSON({
      useAlias: false,
      customKeys: true
    });
    const schema = stripCliFlags(rawSchema) as JsonObject;

    const payload = {
      instructions: buildInstructions(schema),
      schema
    };

    return {
      contents: [
        {
          uri: uri.href,
          mimeType: "application/json",
          text: JSON.stringify(payload, null, 2)
        }
      ]
    };
  }
});
