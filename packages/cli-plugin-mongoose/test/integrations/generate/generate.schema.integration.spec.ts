import {GenerateCmd} from "@tsed/cli";
import {CliPlatformTest, FakeCliFs} from "@tsed/cli-testing";
import {TEMPLATE_DIR} from "../../../src";

describe("Generate Schema", () => {
  beforeEach(() =>
    CliPlatformTest.bootstrap({
      templateDir: TEMPLATE_DIR,
      commands: [GenerateCmd]
    })
  );
  afterEach(() => CliPlatformTest.reset());

  it("should generate the template", async () => {
    CliPlatformTest.setPackageJson({
      name: "",
      version: "1.0.0",
      description: "",
      scripts: {},
      dependencies: {},
      devDependencies: {}
    });

    await CliPlatformTest.exec("generate", {
      rootDir: "./project-data",
      type: "mongoose:schema",
      name: "Product"
    });

    expect(FakeCliFs.getKeys()).toEqual(["project-name/src/models", "project-name/src/models/ProductSchema.ts"]);

    const result = FakeCliFs.entries.get("project-name/src/models/ProductSchema.ts");
    expect(result).toContain("import { Property } from \"@tsed/schema\";");
    expect(result).toContain("import { Schema } from \"@tsed/mongoose\";");
    expect(result).toContain("@Schema()");
    expect(result).toContain("export class ProductSchema {");
  });
});
