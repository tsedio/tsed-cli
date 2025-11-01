import "../src/index.js";

import {GenerateCmd, TEMPLATE_DIR} from "@tsed/cli";
import {CliPlatformTest, FakeCliFs} from "@tsed/cli-testing";

describe("cli-plugin-vitest", () => {
  beforeEach(() =>
    CliPlatformTest.bootstrap({
      templateDir: TEMPLATE_DIR,
      commands: [GenerateCmd]
    })
  );
  afterEach(() => CliPlatformTest.reset());

  it("should generate the template with the right options (simple path)", async () => {
    await CliPlatformTest.initProject({
      vitest: true
    });

    await CliPlatformTest.exec("generate", {
      rootDir: "./project-data",
      type: "controller",
      name: "Test",
      route: "/tests",
      directory: "rest"
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
        "project-name/src/controllers/rest/HelloWorldController.integration.spec.ts",
        "project-name/src/controllers/rest/HelloWorldController.spec.ts",
        "project-name/src/controllers/rest/HelloWorldController.ts",
        "project-name/src/controllers/rest/TestController.integration.spec.ts",
        "project-name/src/controllers/rest/TestController.spec.ts",
        "project-name/src/controllers/rest/TestController.ts",
        "project-name/src/index.ts",
        "project-name/tsconfig.base.json",
        "project-name/tsconfig.json",
        "project-name/tsconfig.node.json",
        "project-name/tsconfig.spec.json",
        "project-name/vitest.config.ts",
      ]
    `);

    const result = FakeCliFs.files.get("project-name/src/controllers/TestController.integration.spec.ts");
    expect(result).toMatchInlineSnapshot(`undefined`);
  });

  it("should generate the template with the right options (complex path)", async () => {
    await CliPlatformTest.initProject();

    await CliPlatformTest.exec("generate", {
      rootDir: "./project-data",
      type: "controller",
      name: "users/User",
      route: "/users"
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
        "project-name/src/controllers/rest/HelloWorldController.integration.spec.ts",
        "project-name/src/controllers/rest/HelloWorldController.spec.ts",
        "project-name/src/controllers/rest/HelloWorldController.ts",
        "project-name/src/controllers/users/UserController.integration.spec.ts",
        "project-name/src/controllers/users/UserController.spec.ts",
        "project-name/src/controllers/users/UserController.ts",
        "project-name/src/index.ts",
        "project-name/tsconfig.base.json",
        "project-name/tsconfig.json",
        "project-name/tsconfig.node.json",
        "project-name/tsconfig.spec.json",
      ]
    `);

    const result = FakeCliFs.files.get("project-name/src/controllers/users/UserController.integration.spec.ts");
    expect(result).toMatchInlineSnapshot(`
      "import { PlatformTest } from "@tsed/platform-http/testing";
      import SuperTest from "supertest";
      import { afterAll, beforeAll, describe, expect, it } from "vitest";
      import { Server } from "../../../../server.js";
      import { UserController } from "./UserController.js";

      describe("UserController", () => {
        beforeAll(PlatformTest.bootstrap(Server, {
          mount: {
            "/": [UserController]
          }
        }));
        afterAll(PlatformTest.reset);

        it("should call GET /users", async () => {
           const request = SuperTest(PlatformTest.callback());
           const response = await request.get("/users").expect(200);

           expect(response.text).toEqual("hello");
        });
      });
      "
    `);
  });
});
