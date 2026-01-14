import "../src/index.js";

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
    await CliPlatformTest.initProject();

    await CliPlatformTest.exec("generate", {
      rootDir: "./project-data",
      type: "mongoose.model",
      name: "Product"
    });

    expect(FakeCliFs.getKeys()).toMatchInlineSnapshot(`
      [
        "project-name",
        "project-name/.barrels.json",
        "project-name/.dockerignore",
        "project-name/.gitignore",
        "project-name/.swcrc",
        "project-name/AGENTS.md",
        "project-name/Dockerfile",
        "project-name/README.md",
        "project-name/docker-compose.yml",
        "project-name/nodemon.json",
        "project-name/package.json",
        "project-name/processes.config.cjs",
        "project-name/src/Server.ts",
        "project-name/src/config/config.ts",
        "project-name/src/config/logger/index.ts",
        "project-name/src/config/utils/index.ts",
        "project-name/src/controllers/pages/IndexController.ts",
        "project-name/src/controllers/rest/HelloWorldController.ts",
        "project-name/src/index.ts",
        "project-name/src/models/ProductModel.ts",
        "project-name/tsconfig.base.json",
        "project-name/tsconfig.json",
        "project-name/tsconfig.node.json",
        "project-name/tsconfig.spec.json",
      ]
    `);

    const result = FakeCliFs.files.get("project-name/src/models/ProductModel.ts");
    expect(result).toMatchInlineSnapshot(`
      "import { Model, ObjectID } from "@tsed/mongoose";
      @Model({
        name: "products"
      })
      export class ProductModel {
        @ObjectID("id")
        _id: string;
      }
      "
    `);
  });
});
