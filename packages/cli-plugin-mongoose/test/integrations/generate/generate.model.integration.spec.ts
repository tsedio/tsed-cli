import "../../../src/index.js";

import {GenerateCmd, TEMPLATE_DIR} from "@tsed/cli";
import {CliPlatformTest, FakeCliFs} from "@tsed/cli-testing";

describe("Generate Model", () => {
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
      type: "mongoose:model",
      name: "Product"
    });

    expect(FakeCliFs.getKeys()).toEqual([
      "project-name/package.json",
      "project-name/src/models",
      "project-name/src/models/ProductModel.ts"
    ]);

    const result = FakeCliFs.files.get("project-name/src/models/ProductModel.ts");
    expect(result).toContain('import { Model, ObjectID } from "@tsed/mongoose";');
    expect(result).toContain("@Model");
    expect(result).toContain('name: "products"');
    expect(result).toContain("export class ProductModel");
  });
});
