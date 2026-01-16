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

  it("should generate a new template with the right options", async () => {
    await CliPlatformTest.initProject();

    await CliPlatformTest.exec("template", {
      rootDir: "./project-data",
      from: "new",
      name: "Test"
    });

    expect(FakeCliFs.getKeys()).toMatchInlineSnapshot(`
      [
        "project-name",
        "project-name/.barrels.json",
        "project-name/.dockerignore",
        "project-name/.gitignore",
        "project-name/.swcrc",
        "project-name/.templates/test.template.ts",
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
        "project-name/src/controllers/rest/HelloWorldController.ts",
        "project-name/src/index.ts",
        "project-name/tsconfig.base.json",
        "project-name/tsconfig.json",
        "project-name/tsconfig.node.json",
        "project-name/tsconfig.spec.json",
        "project-name/views",
        "project-name/views/home.ejs",
      ]
    `);

    const result = FakeCliFs.files.get("project-name/.templates/test.template.ts");

    expect(result).toMatchInlineSnapshot(`
      "import { defineTemplate } from "@tsed/cli";

      export default defineTemplate({
        id: "test",
        label: "Test",
        fileName: "{{symbolName}}.services",
        outputDir: "{{srcDir}}/services",
        render(symbolName, context) {
          return \`export class \${symbolName} {}\`
        }
      });
      "
    `);
  });
  it("should generate a template from existing template", async () => {
    await CliPlatformTest.initProject();

    await CliPlatformTest.exec("template", {
      rootDir: "./project-data",
      from: "existing",
      templateId: "controller",
      name: "Test"
    });

    expect(FakeCliFs.getKeys()).toMatchInlineSnapshot(`
      [
        "project-name",
        "project-name/.barrels.json",
        "project-name/.dockerignore",
        "project-name/.gitignore",
        "project-name/.swcrc",
        "project-name/.templates/test.template.ts",
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
        "project-name/src/controllers/rest/HelloWorldController.ts",
        "project-name/src/index.ts",
        "project-name/tsconfig.base.json",
        "project-name/tsconfig.json",
        "project-name/tsconfig.node.json",
        "project-name/tsconfig.spec.json",
        "project-name/views",
        "project-name/views/home.ejs",
      ]
    `);

    const result = FakeCliFs.files.get("project-name/.templates/test.template.ts");

    expect(result).toMatchInlineSnapshot(`
      "import { defineTemplate } from "@tsed/cli";

      defineTemplate({
        id: "test",
        label: "Test",
        fileName: "{{symbolName}}.controller",
        outputDir: "{{srcDir}}/controllers",
        prompts(context) {
          return [
            {
              type: "list",
              name: "directory",
              message: "Which directory?",
              when(state) {
                return !!([
                  "controller"
                ].includes(state.type || context.type) || context.directory);
              },
              choices: context.getDirectories("controllers")
            },
            {
              type: "input",
              name: "route",
              message: "Which route?",
              when(state) {
                return !!([
                  "controller"
                ].includes(state.type || context.type) || context.route);
              },
              default: (state) => {
                return context.getRoute(state);
              }
            }
          ];
        },
        render(symbolName, context) {
          const route = context.getRoute(context.route);
          return \`import {Controller} from "@tsed/di";
      import {Get} from "@tsed/schema";

      @Controller("\${route}")
      export class \${symbolName} {
        @Get("/")
        get() {
          return "hello";
        }
      }\`;
        }
      });
      "
    `);
  });
  it("should generate a template from existing template and override it", async () => {
    await CliPlatformTest.initProject();

    await CliPlatformTest.exec("template", {
      rootDir: "./project-data",
      from: "existing",
      templateId: "controller",
      name: "Test",
      override: true
    });

    expect(FakeCliFs.getKeys()).toMatchInlineSnapshot(`
      [
        "project-name",
        "project-name/.barrels.json",
        "project-name/.dockerignore",
        "project-name/.gitignore",
        "project-name/.swcrc",
        "project-name/.templates/test.template.ts",
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
        "project-name/src/controllers/rest/HelloWorldController.ts",
        "project-name/src/index.ts",
        "project-name/tsconfig.base.json",
        "project-name/tsconfig.json",
        "project-name/tsconfig.node.json",
        "project-name/tsconfig.spec.json",
        "project-name/views",
        "project-name/views/home.ejs",
      ]
    `);

    const result = FakeCliFs.files.get("project-name/.templates/test.template.ts");

    expect(result).toMatchInlineSnapshot(`
      "import { defineTemplate } from "@tsed/cli";

      defineTemplate({
        id: "controller",
        label: "Test",
        fileName: "{{symbolName}}.controller",
        outputDir: "{{srcDir}}/controllers",
        prompts(context) {
          return [
            {
              type: "list",
              name: "directory",
              message: "Which directory?",
              when(state) {
                return !!([
                  "controller"
                ].includes(state.type || context.type) || context.directory);
              },
              choices: context.getDirectories("controllers")
            },
            {
              type: "input",
              name: "route",
              message: "Which route?",
              when(state) {
                return !!([
                  "controller"
                ].includes(state.type || context.type) || context.route);
              },
              default: (state) => {
                return context.getRoute(state);
              }
            }
          ];
        },
        render(symbolName, context) {
          const route = context.getRoute(context.route);
          return \`import {Controller} from "@tsed/di";
      import {Get} from "@tsed/schema";

      @Controller("\${route}")
      export class \${symbolName} {
        @Get("/")
        get() {
          return "hello";
        }
      }\`;
        }
      });
      "
    `);
  });
});
