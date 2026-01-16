import "../src/index.js";

import {GenerateCmd, TEMPLATE_DIR} from "@tsed/cli";
import {CliPlatformTest, FakeCliFs} from "@tsed/cli-testing";

describe("Generate Controller", () => {
  beforeEach(() =>
    CliPlatformTest.bootstrap({
      templateDir: TEMPLATE_DIR,
      commands: [GenerateCmd]
    })
  );
  afterEach(() => CliPlatformTest.reset());
  it("should init files", async () => {
    await CliPlatformTest.initProject({
      jest: true
    });

    const result = FakeCliFs.files.get("project-name/jest.config.mjs");

    expect(result).toMatchInlineSnapshot(`
      "// For a detailed explanation regarding each configuration property, visit:
      // https://jestjs.io/docs/en/configuration.html

      /** @type {import('jest').Config} */
      export default {
        // Automatically clear mock calls and instances between every test
        clearMocks: true,

        // Indicates whether the coverage information should be collected while executing the test
        collectCoverage: true,

        // An array of glob patterns indicating a set of files for which coverage information should be collected
        // collectCoverageFrom: undefined,

        // The directory where Jest should output its coverage files
        coverageDirectory: "coverage",

        // An array of regexp pattern strings used to skip coverage collection
        coveragePathIgnorePatterns: ["index.ts", "/node_modules/"],

        // An object that configures minimum threshold enforcement for coverage results
        coverageThreshold: {
          global: {
            branches: 70,
            functions: 70,
            lines: 70,
            statements: 70
          }
        },

        // An array of file extensions your modules use
        moduleFileExtensions: ["js", "json", "jsx", "ts", "tsx", "node"],
        extensionsToTreatAsEsm: [".ts", ".tsx"],
        // The test environment that will be used for testing
        testEnvironment: "node",

        // The glob patterns Jest uses to detect test files
        testMatch: ["**/src/**/__tests__/**/*.[jt]s?(x)", "**/src/**/?(*.)+(spec|test).[tj]s?(x)"],
        // A map from regular expressions to paths to transformers
        transform: {
          "^.+\\\\.(j|t)sx?$": [
            "@swc/jest",
            {
              jsc: {
                parser: {
                  syntax: "typescript",
                  tsx: true,
                  decorators: true,
                  dynamicImport: true,
                  importMeta: true,
                  preserveAllComments: true
                },
                target: "esnext",
                transform: {
                  useDefineForClassFields: false,
                  legacyDecorator: true,
                  decoratorMetadata: true
                }
              },
              module: {
                type: "es6"
              }
            }
          ]
        },
        moduleNameMapper: {
          "^(\\\\.{1,2}/.*)\\\\.js$": "$1"
        },
        testPathIgnorePatterns: ["/node_modules/", "/dist/"],
        transformIgnorePatterns: ["/node_modules/(?!(module-name|another-module)/)"]
      };
      "
    `);
  });
  it("should generate the template with the right options (simple path)", async () => {
    await CliPlatformTest.initProject({
      jest: true
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
        "project-name/AGENTS.md",
        "project-name/Dockerfile",
        "project-name/README.md",
        "project-name/docker-compose.yml",
        "project-name/jest.config.mjs",
        "project-name/nodemon.json",
        "project-name/package.json",
        "project-name/processes.config.cjs",
        "project-name/src/Server.ts",
        "project-name/src/config/config.ts",
        "project-name/src/config/logger/index.ts",
        "project-name/src/config/utils/index.ts",
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
        "project-name/views",
        "project-name/views/home.ejs",
      ]
    `);

    const result = FakeCliFs.files.get("project-name/src/controllers/TestController.integration.spec.ts");
    expect(result).toMatchInlineSnapshot(`undefined`);
  });
  it("should generate the template with the right options (complex path)", async () => {
    await CliPlatformTest.initProject({
      jest: true
    });

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
        "project-name/AGENTS.md",
        "project-name/Dockerfile",
        "project-name/README.md",
        "project-name/docker-compose.yml",
        "project-name/jest.config.mjs",
        "project-name/nodemon.json",
        "project-name/package.json",
        "project-name/processes.config.cjs",
        "project-name/src/Server.ts",
        "project-name/src/config/config.ts",
        "project-name/src/config/logger/index.ts",
        "project-name/src/config/utils/index.ts",
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
        "project-name/views",
        "project-name/views/home.ejs",
      ]
    `);

    const result = FakeCliFs.files.get("project-name/src/controllers/users/UserController.integration.spec.ts");
    expect(result).toMatchInlineSnapshot(`
      "import { PlatformTest } from "@tsed/platform-http/testing";
      import SuperTest from "supertest";
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
