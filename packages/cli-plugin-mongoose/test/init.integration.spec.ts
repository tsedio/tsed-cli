import "../src/index.js";

import {GenerateCmd, TEMPLATE_DIR} from "@tsed/cli";
import {CliPlatformTest, FakeCliFs} from "@tsed/cli-testing";

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
      mongoose: true
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
        "project-name/src/config/mongoose/MongooseDefaultConnection.ts",
        "project-name/src/config/mongoose/index.ts",
        "project-name/src/config/utils/index.ts",
        "project-name/src/controllers/pages/IndexController.ts",
        "project-name/src/controllers/rest/HelloWorldController.ts",
        "project-name/src/index.ts",
        "project-name/tsconfig.base.json",
        "project-name/tsconfig.json",
        "project-name/tsconfig.node.json",
      ]
    `);

    expect(FakeCliFs.files.get("project-name/src/config/mongoose/MongooseDefaultConnection.ts")).toMatchInlineSnapshot(`
      "export default {
        id: "MongooseDefaultConnection",
        url: process.env.MONGOOSE_DEFAULT_CONNECTION_URL || "mongodb://localhost:27017/mongoose-default",
        connectionOptions: { }
      }"
    `);
    expect(FakeCliFs.files.get("project-name/src/config/mongoose/index.ts")).toMatchInlineSnapshot(`
      "import mongooseDefaultConnection from "./MongooseDefaultConnection.js";

      //keep this default 
      export default [mongooseDefaultConnection];"
    `);
    expect(FakeCliFs.files.get("project-name/docker-compose.yml")).toMatchInlineSnapshot(`
      "services:
        mongodb:
          image: mongo:5.0.8
          ports:
            - '27017:27017'
      "
    `);
  });
});
