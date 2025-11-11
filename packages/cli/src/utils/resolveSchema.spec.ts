import {s} from "@tsed/schema";

import {resolveSchema} from "./resolveSchema.js";

describe("resolveSchema", () => {
  it("should resolve given schema with x-remote-choices", async () => {
    const schema = s.object({
      prop: s
        .string()
        .enum("test", "test2")
        .customKey("x-remote-choices", () => {
          return Promise.resolve([
            {
              label: "Test label",
              value: "test"
            },
            {
              label: "Test label 2",
              value: "test2"
            }
          ]);
        })
    });

    const result = await resolveSchema(schema);

    expect(result).toEqual({
      properties: {
        prop: {
          enum: ["test", "test2"],
          type: "string",
          "x-choices": [
            {
              label: "Test label",
              value: "test"
            },
            {
              label: "Test label 2",
              value: "test2"
            }
          ],
          "x-remote-choices": undefined
        }
      },
      type: "object"
    });
  });
});
