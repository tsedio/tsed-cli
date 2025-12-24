import {s} from "@tsed/schema";

import {Command} from "../decorators/index.js";
import {getCommandMetadata} from "./getCommandMetadata.js";

@Command({
  name: "name",
  description: "description",
  alias: "g"
})
class TestCmd {}

@Command({
  name: "name",
  description: "description",
  alias: "g",
  bindLogger: false
})
class TestCmd2 {}

describe("getCommandMetadata", () => {
  it("should return command metadata", () => {
    const {getOptions, ...result} = getCommandMetadata(TestCmd);
    expect({
      ...result,
      ...getOptions()
    }).toEqual({
      args: {},
      allowUnknownOption: false,
      description: "description",
      name: "name",
      alias: "g",
      inputSchema: undefined,
      disableReadUpPkg: false,
      enableFeatures: [],
      bindLogger: true,
      options: {},
      token: TestCmd
    });
  });
  it("should return command metadata (2)", () => {
    const {getOptions, ...result} = getCommandMetadata(TestCmd2);
    expect({
      ...result,
      ...getOptions()
    }).toEqual({
      args: {},
      allowUnknownOption: false,
      description: "description",
      name: "name",
      alias: "g",
      inputSchema: undefined,
      disableReadUpPkg: false,
      enableFeatures: [],
      bindLogger: false,
      options: {},
      token: TestCmd2
    });
  });

  it("should map inputSchema properties to args and options (direct schema)", () => {
    const schema = s
      .object({
        filename: s.string().required(),
        verbose: s.boolean(),
        list: s.array().items(s.string())
      })
      .set("custom-parser", (v: any) => v);

    // enrich properties with metadata used by getCommandMetadata
    const props = schema.get("properties") as any;
    props.filename.set("arg", "filename").set("description", "The file to process").set("default", "index.ts");
    props.verbose.set("opt", "--verbose").set("description", "Enable verbose mode").set("default", false);
    props.list.set("opt", "--list").set("description", "List of items");

    @Command({
      name: "with-schema",
      description: "cmd with schema",
      alias: "ws",
      inputSchema: schema
    })
    class Cmd {}

    const metadata = getCommandMetadata(Cmd);

    // inputSchema should be kept
    expect(metadata.inputSchema).toBe(schema);

    // args mapped from property with `arg`
    expect(metadata.getOptions().args).toEqual(
      expect.objectContaining({
        filename: expect.objectContaining({
          description: "The file to process",
          defaultValue: "index.ts",
          type: String
        })
      })
    );

    // options mapped from properties with `opt`, including customParser from root schema
    expect(metadata.getOptions().options).toEqual(
      expect.objectContaining({
        "--verbose": expect.objectContaining({
          description: "Enable verbose mode",
          defaultValue: false,
          required: false,
          type: Boolean,
          customParser: schema.get("custom-parser")
        }),
        "--list": expect.objectContaining({
          description: "List of items",
          required: false,
          type: Array,
          itemType: String
        })
      })
    );
  });

  it("should support inputSchema as a factory function (arrow fn)", () => {
    const inner = s.object({count: s.number()});
    inner.get("properties").count.set("opt", "-c").set("description", "Count");

    @Command({
      name: "with-fn",
      description: "cmd with schema fn",
      alias: "wf",
      inputSchema: () => inner
    })
    class Cmd {}

    const metadata = getCommandMetadata(Cmd);

    expect(metadata.inputSchema).toBeTypeOf("function");
    // getCommandMetadata resolves the function and maps options
    expect(metadata.getOptions().options).toEqual(
      expect.objectContaining({
        "-c": expect.objectContaining({
          description: "Count",
          type: Number
        })
      })
    );
  });
});
