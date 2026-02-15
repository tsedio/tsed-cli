import "../../src/index.js";

import {InitCmd, ProjectConvention, TEMPLATE_DIR} from "@tsed/cli";
import {CliPlatformTest, FakeCliFs} from "@tsed/cli-testing";

describe("Init TypeGraphQL project", () => {
  beforeEach(() =>
    CliPlatformTest.bootstrap({
      templateDir: TEMPLATE_DIR,
      commands: [InitCmd]
    })
  );
  afterEach(() => CliPlatformTest.reset());

  it("should generate a project with typegraphql", async () => {
    CliPlatformTest.setPackageJson({
      name: "",
      version: "1.0.0",
      description: "",
      scripts: {},
      dependencies: {},
      devDependencies: {}
    });

    await CliPlatformTest.exec("init", {
      platform: "express",
      convention: ProjectConvention.DEFAULT,
      rootDir: "./project-data",
      projectName: "project-data",
      tsedVersion: "5.58.1",
      graphql: true
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
        "project-name/src/graphql/models/RecipeModel.ts",
        "project-name/src/graphql/resolvers/RecipeResolver.ts",
        "project-name/src/index.ts",
        "project-name/src/services/RecipeService.ts",
        "project-name/tsconfig.base.json",
        "project-name/tsconfig.json",
        "project-name/tsconfig.node.json",
        "project-name/tsconfig.spec.json",
        "project-name/views",
        "project-name/views/home.ejs",
      ]
    `);

    const content = FakeCliFs.files.get("project-name/src/Server.ts")!;
    expect(content).toMatchInlineSnapshot(`
      "import "@tsed/ajv";
      import "@tsed/platform-log-request";

      import { Configuration } from "@tsed/di";
      import { application } from "@tsed/platform-http";
      import { join } from "node:path";

      import { config } from "@/config/config.js";
      import "@tsed/platform-express";
      import "@tsed/typegraphql";
      import * as pages from "./controllers/pages/index.js";
      import * as rest from "./controllers/rest/index.js";
      import "./graphql/datasources/index.js";
      import "./graphql/resolvers/index.js";

      @Configuration({
        ...config,
        acceptMimes: ["application/json"],
        httpPort: process.env.PORT || 8083,
        httpsPort: false, // CHANGE
        mount: {
          "/rest": [...Object.values(rest), ...Object.values(rest)],
          "/": [...Object.values(pages), ...Object.values(pages)]
        },
        views: {
          root: join(process.cwd(), "../views"),
          extensions: {
            ejs: "ejs"
          }
        },
        middlewares: [
          "cors",
          "cookie-parser",
          "compression",
          "method-override",
          "json-parser",
          {
            "use": "urlencoded-parser",
            "options": {
              "extended": true
            }
          }
        ]
      })
      export class Server {
        protected app = application();
      }
      "
    `);

    const configContent = FakeCliFs.files.get("project-name/src/config/config.ts")!;
    expect(configContent).toMatchInlineSnapshot(`
      "import { EnvsConfigSource } from "@tsed/config/envs";
      import { readFileSync } from "node:fs";
      import loggerConfig from "./logger/index.js";

      const pkg = JSON.parse(readFileSync("./package.json", { encoding: "utf8" }));
      /**
       * This is the shared configuration for the application
       */
      export const config: Partial<TsED.Configuration> = {
        version: pkg.version,
        ajv: {
          returnsCoercedValues: true
        },
        logger: loggerConfig,
        extends: [
          EnvsConfigSource],
        graphql: {
          default: {
            path: "/graphql",
            buildSchemaOptions: {}
          }
        }
      };
      "
    `);

    const recipeResolverContent = FakeCliFs.files.get("project-name/src/graphql/resolvers/RecipeResolver.ts")!;

    expect(recipeResolverContent).toMatchInlineSnapshot(`
      "import { ResolverService } from "@tsed/typegraphql";
      import { Arg, Query } from "type-graphql";
      import { RecipeService } from "../../services/RecipeService.js";
      import { RecipeModel } from "../models/RecipeModel.js";

      @ResolverService(RecipeModel)
      export class RecipeResolver {
        protected service = inject(RecipeService);

        @Query((returns) => RecipeModel)
        async recipe(@Arg("id") id: string) {
          return this.service.getById(id);
        }

        @Query((returns) => [RecipeModel], { description: "Get all items" })
        recipes(): Promise<RecipeModel[]> {
          return this.service.findAll({});
        }
      }
      "
    `);

    const recipeModelContent = FakeCliFs.files.get("project-name/src/graphql/models/RecipeModel.ts")!;

    expect(recipeModelContent).toMatchInlineSnapshot(`
      "import { Field, ID, ObjectType } from "type-graphql";

      @ObjectType({ description: "Object representing cooking RecipeModel" })
      export class RecipeModel {
        @Field((type) => ID)
        id: string;

        constructor(options: Partial<RecipeModel> = {}) {
          options.id && (this.id = options.id);
        }
      }
      "
    `);
  });
});
