import {CliService, ProjectPackageJson} from "@tsed/cli-core";
import {CliPlatformTest, FakeCliFs} from "@tsed/cli-testing";
import {existsSync, readFileSync, writeFileSync} from "fs";
import {resolve} from "path";
import {InitCmd} from "../../../src";

const TEMPLATE_DIR = resolve(__dirname, "..", "..", "..", "templates");

function readFile(file: string, content: string) {
  if (!existsSync(file)) {
    writeFileSync(`${__dirname}/${file}`, content, {encoding: "utf8"})
  }

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

  describe("Express.js", () => {
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
        platform: "express",
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

      const content = FakeCliFs.entries.get("project-name/src/Server.ts")!
      expect(content).toContain("import {Configuration, Inject} from \"@tsed/di\"");
      expect(content).toContain("import \"@tsed/platform-express\"");
      expect(content).toContain("import \"@tsed/ajv\"");
      expect(content).toEqual(readFile("data/Server.express.ts.txt", content));

      const pkg = JSON.parse(FakeCliFs.entries.get("project-name/package.json")!);
      expect(pkg).toEqual({
        dependencies: {
          "@tsed/ajv": "5.58.1",
          "@tsed/common": "5.58.1",
          "@tsed/core": "5.58.1",
          "@tsed/di": "5.58.1",
          "@tsed/exceptions": "5.58.1",
          "@tsed/platform-express": "5.58.1",
          "@tsed/schema": "5.58.1",
          "@tsed/json-mapper": "5.58.1"
        },
        description: "",
        devDependencies: {},
        name: "project-data",
        scripts: {
          build: "yarn tsc",
          start: "nodemon --watch \"src/**/*.ts\" --ignore \"node_modules/**/*\" --exec ts-node src/index.ts",
          "start:prod": "cross-env NODE_ENV=production node dist/index.js",
          tsc: "tsc --project tsconfig.compile.json",
          "tsc:w": "tsc --project tsconfig.json -w"
        },
        version: "1.0.0"
      });
    });
    it("should generate a project with swagger", async () => {
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
        platform: "express",
        rootDir: "./project-data",
        projectName: "project-data",
        tsedVersion: "5.58.1",
        swagger: true
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
        "project-name/src/controllers/pages",
        "project-name/src/controllers/pages/IndexCtrl.ts",
        "project-name/src/index.ts",
        "project-name/tsconfig.compile.json",
        "project-name/tsconfig.json",
        "project-name/views",
        "project-name/views/index.ejs"
      ]);

      const content = FakeCliFs.entries.get("project-name/src/Server.ts")!

      expect(content).toContain("import {Configuration, Inject} from \"@tsed/di\"");
      expect(content).toContain("import \"@tsed/platform-express\"");
      expect(content).toContain("import \"@tsed/ajv\"");
      expect(content).toEqual(readFile("data/Server.express.swagger.ts.txt", content));

      const pkg = JSON.parse(FakeCliFs.entries.get("project-name/package.json")!);
      expect(pkg).toEqual({
        dependencies: {
          "@tsed/ajv": "5.58.1",
          "@tsed/common": "5.58.1",
          "@tsed/core": "5.58.1",
          "@tsed/di": "5.58.1",
          "@tsed/exceptions": "5.58.1",
          "@tsed/platform-express": "5.58.1",
          "@tsed/schema": "5.58.1",
          "@tsed/json-mapper": "5.58.1"
        },
        description: "",
        devDependencies: {},
        name: "project-data",
        scripts: {
          build: "yarn tsc",
          start: "nodemon --watch \"src/**/*.ts\" --ignore \"node_modules/**/*\" --exec ts-node src/index.ts",
          "start:prod": "cross-env NODE_ENV=production node dist/index.js",
          tsc: "tsc --project tsconfig.compile.json",
          "tsc:w": "tsc --project tsconfig.json -w"
        },
        version: "1.0.0"
      });
    });
  });

  describe("Koa.js", () => {
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
        platform: "koa",
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

      const content = FakeCliFs.entries.get("project-name/src/Server.ts")!

      expect(content).toContain("import {Configuration, Inject} from \"@tsed/di\"");
      expect(content).toContain("import \"@tsed/platform-koa\"");
      expect(content).toContain("import \"@tsed/ajv\"");
      expect(content).toEqual(readFile("data/Server.koa.ts.txt", content));

      const pkg = JSON.parse(FakeCliFs.entries.get("project-name/package.json")!);
      expect(pkg).toEqual({
        dependencies: {
          "@tsed/ajv": "5.58.1",
          "@tsed/common": "5.58.1",
          "@tsed/core": "5.58.1",
          "@tsed/di": "5.58.1",
          "@tsed/exceptions": "5.58.1",
          "@tsed/platform-koa": "5.58.1",
          "@tsed/schema": "5.58.1",
          "@tsed/json-mapper": "5.58.1"
        },
        description: "",
        devDependencies: {},
        name: "project-data",
        scripts: {
          build: "yarn tsc",
          start: "nodemon --watch \"src/**/*.ts\" --ignore \"node_modules/**/*\" --exec ts-node src/index.ts",
          "start:prod": "cross-env NODE_ENV=production node dist/index.js",
          tsc: "tsc --project tsconfig.compile.json",
          "tsc:w": "tsc --project tsconfig.json -w"
        },
        version: "1.0.0"
      });
    });
  });
});
