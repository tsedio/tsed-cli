import {GenerateCmd} from "@tsed/cli";
import {CliService, ProjectPackageJson} from "@tsed/cli-core";
import {CliPlatformTest, FakeCliFs} from "@tsed/cli-testing";
import {resolve} from "path";
import "../../../src";

const TEMPLATE_DIR = resolve(require.resolve("@tsed/cli"), "..", "..", "templates");

describe("Generate Model", () => {
  beforeEach(() =>
    CliPlatformTest.bootstrap({
      templateDir: TEMPLATE_DIR,
      commands: [GenerateCmd]
    })
  );
  afterEach(() => CliPlatformTest.reset());

  it("should generate the template", async () => {
    const cliService = CliPlatformTest.get<CliService>(CliService);
    const projectPackageJson = CliPlatformTest.get<ProjectPackageJson>(ProjectPackageJson);
    projectPackageJson.setRaw({
      name: "",
      version: "1.0.0",
      description: "",
      scripts: {},
      dependencies: {},
      devDependencies: {}
    });

    await cliService.exec("generate", {
      rootDir: "./project-data",
      type: "mongoose:model",
      name: "Product"
    });

    expect(FakeCliFs.getKeys()).toEqual(["project-name/src/models", "project-name/src/models/ProductModel.ts"]);

    const result = FakeCliFs.entries.get("project-name/src/models/ProductModel.ts");
    expect(result).toContain('import { Model, ObjectID } from "@tsed/mongoose";');
    expect(result).toContain("@Model");
    expect(result).toContain('name: "products"');
    expect(result).toContain("export class ProductModel");
  });
});
