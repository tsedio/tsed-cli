import {CliPlatformTest, FakeCliFs} from "@tsed/cli-testing";
import {readFileSync} from "fs";
import {resolve} from "path";
import {CliService, ProjectPackageJson} from "@tsed/cli-core";
import {InitCmd} from "../../../src";

const TEMPLATE_DIR = resolve(__dirname, "..", "..", "..", "templates");

function readFile(file: string) {
  return readFileSync(`${__dirname}/${file}`, {encoding: "utf8"});
}

describe("Init cmd", () => {
  beforeEach(() =>
    CliPlatformTest.bootstrap({
      templateDir: TEMPLATE_DIR,
      commands: [InitCmd]
    })
  );
  afterEach(() => CliPlatformTest.reset());

  it("should generate a project with the right options", async () => {
    const cliService = CliPlatformTest.get<CliService>(CliService);
    const projectPackageJson = CliPlatformTest.get<ProjectPackageJson>(ProjectPackageJson);
    // @ts-ignore
    projectPackageJson.raw = {
      name: "",
      version: "1.0.0",
      description: "",
      scripts: {},
      dependencies: {},
      devDependencies: {}
    };

    await cliService.exec("init", {
      rootDir: "./project-data",
      projectName: "project-data",
      tsedVersion: "5.58.1"
    });

    expect(FakeCliFs.getKeys()).toEqual([
      "./project-name",
      "project-name",
      "project-name/.dockerignore",
      "project-name/.gitignore",
      "project-name/Dockerfile",
      "project-name/README.md",
      "project-name/docker-compose.yml",
      "project-name/package.json",
      "project-name/src",
      "project-name/src/Server.ts",
      "project-name/src/controllers",
      "project-name/src/controllers/HelloWorldController.ts",
      "project-name/src/index.ts",
      "project-name/tsconfig.compile.json",
      "project-name/tsconfig.json"
    ]);

    expect(FakeCliFs.entries.get("project-name/src/Server.ts")).toContain("import {Configuration, Inject} from \"@tsed/di\"");
    expect(FakeCliFs.entries.get("project-name/src/Server.ts")).toContain("import \"@tsed/platform-express\"");
    expect(FakeCliFs.entries.get("project-name/src/Server.ts")).toContain("import \"@tsed/ajv\"");
    expect(FakeCliFs.entries.get("project-name/src/Server.ts")).toEqual(readFile("data/Server.ts.txt"));

    const pkg = JSON.parse(FakeCliFs.entries.get("project-name/package.json")!);
    expect(pkg).toEqual({
      "dependencies": {
        "@tsed/ajv": "5.58.1",
        "@tsed/common": "5.58.1",
        "@tsed/core": "5.58.1",
        "@tsed/di": "5.58.1",
        "@tsed/exceptions": "5.58.1",
        "@tsed/platform-express": "5.58.1",
        "ajv": "1.0.0",
        "body-parser": "1.0.0",
        "compression": "1.0.0",
        "concurrently": "1.0.0",
        "cookie-parser": "1.0.0",
        "cors": "1.0.0",
        "cross-env": "1.0.0",
        "express": "1.0.0",
        "method-override": "1.0.0"
      },
      "description": "",
      "devDependencies": {
        "@types/compression": "1.0.0",
        "@types/cookie-parser": "1.0.0",
        "@types/cors": "2.8.6",
        "@types/express": "1.0.0",
        "@types/method-override": "1.0.0",
        "@types/node": "1.0.0",
        "concurrently": "1.0.0",
        "nodemon": "1.0.0",
        "ts-node": "1.0.0",
        "typescript": "1.0.0"
      },
      "name": "project-data",
      "scripts": {
        "build": "yarn tsc",
        "start": "nodemon --watch \"src/**/*.ts\" --ignore \"node_modules/**/*\" --exec ts-node src/index.ts",
        "start:prod": "cross-env NODE_ENV=production node dist/index.js",
        "tsc": "tsc --project tsconfig.compile.json",
        "tsc:w": "tsc --project tsconfig.json -w"
      },
      "version": "1.0.0"
    });
  });
});
