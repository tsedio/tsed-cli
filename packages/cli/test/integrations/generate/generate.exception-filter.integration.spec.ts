// @ts-ignore
import {CliPlatformTest, FakeCliFs} from "@tsed/cli-testing";

import {GenerateCmd, TEMPLATE_DIR} from "../../../src/index.js";

describe("Generate Exception Filter", () => {
  beforeEach(() =>
    CliPlatformTest.bootstrap({
      templateDir: TEMPLATE_DIR,
      commands: [GenerateCmd]
    })
  );
  afterEach(() => CliPlatformTest.reset());

  it("should generate a template with the right options", async () => {
    await CliPlatformTest.initProject();

    await CliPlatformTest.exec("generate", {
      rootDir: "./project-data",
      type: "exception-filter",
      name: "Http"
    });

    expect(FakeCliFs.getKeys()).toMatchInlineSnapshot(`
      [
        "project-name",
        "project-name/.barrels.json",
        "project-name/.dockerignore",
        "project-name/.gitignore",
        "project-name/.swcrc",
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
        "project-name/src/filters/HttpExceptionFilter.ts",
        "project-name/src/index.ts",
        "project-name/tsconfig.base.json",
        "project-name/tsconfig.json",
        "project-name/tsconfig.node.json",
      ]
    `);

    const result = FakeCliFs.files.get("project-name/src/filters/HttpExceptionFilter.ts");

    expect(result).toMatchInlineSnapshot(`
      "import { BaseContext } from "@tsed/di";
      import { Catch, ExceptionFilterMethods } from "@tsed/platform-exceptions";

      @Catch(Error)
      export class HttpExceptionFilter implements ExceptionFilterMethods {
         catch(exception: Exception, ctx: BaseContext) {

         }
      }
      "
    `);
  });
});
