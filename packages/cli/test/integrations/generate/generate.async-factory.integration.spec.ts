// @ts-ignore
import {CliPlatformTest, FakeCliFs} from "@tsed/cli-testing";

import {GenerateCmd} from "../../../src/index.js";

describe("Generate AsyncFactory", () => {
  beforeEach(() =>
    CliPlatformTest.bootstrap({
      commands: [GenerateCmd]
    })
  );
  afterEach(() => CliPlatformTest.reset());

  it("should generate a template with the right options", async () => {
    await CliPlatformTest.initProject();

    await CliPlatformTest.exec("generate", {
      rootDir: "./project-data",
      type: "async.factory",
      name: "TestFactory"
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
        "project-name/src/services/TestFactory.ts",
        "project-name/tsconfig.base.json",
        "project-name/tsconfig.json",
        "project-name/tsconfig.node.json",
        "project-name/tsconfig.spec.json",
      ]
    `);

    const result = FakeCliFs.files.get("project-name/src/services/TestFactory.ts");

    expect(result).toMatchInlineSnapshot(`
      "import { constant, injectable } from "@tsed/di";

      interface TestFactoryOptions {

      }

      declare global {
        namespace TsED {
          interface Configuration extends Record<string, any> {
            testFactory: TestFactoryOptions;
          }
        }
      }

      export const TestFactory = injectable(Symbol.for("TestFactory"))
        .factory(async () => {
          const myConstant = constant<TestFactoryOptions>("testFactory");

          // do something async
          await Promise.resolve();

          return {};
        })
        .token();

      export type TestFactory = typeof TestFactory;
      "
    `);
  });
});
