// @ts-ignore
import {CliPlatformTest, FakeCliFs} from "@tsed/cli-testing";

import {GenerateCmd, TEMPLATE_DIR} from "../../../src/index.js";

describe("Generate middleware decorator", () => {
  beforeEach(() =>
    CliPlatformTest.bootstrap({
      templateDir: TEMPLATE_DIR,
      commands: [GenerateCmd]
    })
  );
  afterEach(() => CliPlatformTest.reset());

  it("should generate a template with the right options (before)", async () => {
    await CliPlatformTest.initProject();

    await CliPlatformTest.exec("generate", {
      rootDir: "./project-data",
      type: "decorator",
      templateType: "middleware",
      name: "Test",
      middlewarePosition: "before"
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
        "project-name/src/decorators/Test.ts",
        "project-name/src/index.ts",
        "project-name/tsconfig.base.json",
        "project-name/tsconfig.json",
        "project-name/tsconfig.node.json",
        "project-name/tsconfig.spec.json",
      ]
    `);

    const result = FakeCliFs.files.get("project-name/src/decorators/Test.ts");

    expect(result).toMatchInlineSnapshot(`
      "import { Next } from "@tsed/common";
      import { Middleware, MiddlewareMethods } from "@tsed/platform-middlewares";
      import { Context } from "@tsed/platform-params";

      export interface TestOptions {

      }

      export function Test(options: TestOptions = {}): ClassDecorator {
        return (target: any) => {
          @Middleware()
          class TestMiddleware implements MiddlewareMethods {
            use(@Context() ctx: Context, @Next() next: Next) {
              // do something
              return next();
            }
          }

          return target;
        };
      }
      "
    `);
  });
  it("should generate a template with the right options (after)", async () => {
    await CliPlatformTest.initProject();
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
      type: "decorator",
      templateType: "middleware",
      name: "Test",
      middlewarePosition: "after"
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
        "project-name/src/decorators/Test.ts",
        "project-name/src/index.ts",
        "project-name/tsconfig.base.json",
        "project-name/tsconfig.json",
        "project-name/tsconfig.node.json",
        "project-name/tsconfig.spec.json",
      ]
    `);

    const result = FakeCliFs.files.get("project-name/src/decorators/Test.ts");

    expect(result).toMatchInlineSnapshot(`
      "import { Next } from "@tsed/common";
      import { Middleware, MiddlewareMethods } from "@tsed/platform-middlewares";
      import { Context } from "@tsed/platform-params";

      export interface TestOptions {

      }

      export function Test(options: TestOptions = {}): ClassDecorator {
        return (target: any) => {
          @Middleware()
          class TestMiddleware implements MiddlewareMethods {
            use(@Context() ctx: Context, @Next() next: Next) {
              // do something
              return next();
            }
          }

          return target;
        };
      }
      "
    `);
  });
});
