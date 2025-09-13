import "../src/index.js";

import {GenerateCmd, TEMPLATE_DIR} from "@tsed/cli";
import {ProjectPackageJson} from "@tsed/cli-core";
import {CliPlatformTest, FakeCliFs} from "@tsed/cli-testing";
import {inject} from "@tsed/di";

describe("Init integration", () => {
  beforeEach(() =>
    CliPlatformTest.bootstrap({
      templateDir: TEMPLATE_DIR,
      commands: [GenerateCmd]
    })
  );
  afterEach(() => CliPlatformTest.reset());

  it("should init a project", async () => {
    await CliPlatformTest.initProject({
      passport: true
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
        "project-name/src/index.ts",
        "project-name/tsconfig.base.json",
        "project-name/tsconfig.json",
        "project-name/tsconfig.node.json",
      ]
    `);

    expect(inject(ProjectPackageJson).dependencies).toMatchInlineSnapshot(`
      {
        "@swc-node/register": "latest",
        "@swc/cli": "latest",
        "@swc/core": "latest",
        "@swc/helpers": "latest",
        "@tsed/ajv": "5.58.1",
        "@tsed/barrels": "latest",
        "@tsed/config": "5.58.1",
        "@tsed/core": "5.58.1",
        "@tsed/di": "5.58.1",
        "@tsed/engines": "latest",
        "@tsed/exceptions": "5.58.1",
        "@tsed/json-mapper": "5.58.1",
        "@tsed/logger": "latest",
        "@tsed/openspec": "5.58.1",
        "@tsed/passport": "5.58.1",
        "@tsed/platform-cache": "5.58.1",
        "@tsed/platform-exceptions": "5.58.1",
        "@tsed/platform-express": "5.58.1",
        "@tsed/platform-http": "5.58.1",
        "@tsed/platform-log-request": "5.58.1",
        "@tsed/platform-middlewares": "5.58.1",
        "@tsed/platform-multer": "5.58.1",
        "@tsed/platform-params": "5.58.1",
        "@tsed/platform-response-filter": "5.58.1",
        "@tsed/platform-views": "5.58.1",
        "@tsed/schema": "5.58.1",
        "ajv": "latest",
        "body-parser": "latest",
        "compression": "latest",
        "cookie-parser": "latest",
        "cors": "latest",
        "cross-env": "latest",
        "express": "latest",
        "method-override": "latest",
        "passport": "latest",
        "typescript": "latest",
      }
    `);
    expect(inject(ProjectPackageJson).devDependencies).toMatchInlineSnapshot(`
      {
        "@types/compression": "latest",
        "@types/cookie-parser": "latest",
        "@types/cors": "latest",
        "@types/express": "latest",
        "@types/method-override": "latest",
        "@types/multer": "latest",
        "@types/node": "latest",
        "@types/passport": "latest",
        "nodemon": "latest",
        "tslib": "latest",
      }
    `);

    expect(FakeCliFs.files.get("project-name/src/Server.ts")).toMatchInlineSnapshot(`
      "import "@tsed/ajv";
      import "@tsed/platform-log-request";

      import { Configuration } from "@tsed/di";
      import { application } from "@tsed/platform-http";
      import { join } from "node:path";

      import { config } from "@/config/config.js";
      import "@tsed/passport";
      import "@tsed/platform-express";
      import * as rest from "./controllers/rest/index.js";

      @Configuration({
        ...config,
        acceptMimes: ["application/json"],
        httpPort: process.env.PORT || 8083,
        httpsPort: false, // CHANGE
        mount: {
          "/rest": [...Object.values(rest)]
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
  });
});
