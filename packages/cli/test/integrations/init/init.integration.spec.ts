import {CliService, PackageManager, ProjectPackageJson} from "@tsed/cli-core";
import {CliPlatformTest, FakeCliFs} from "@tsed/cli-testing";
import {ensureDirSync, existsSync, readFileSync, writeFileSync} from "fs-extra";
import {dirname, join, resolve} from "path";
import {InitCmd, ProjectConvention} from "../../../src";

const TEMPLATE_DIR = resolve(__dirname, "..", "..", "..", "templates");

function readFile(file: string, content: string, rewrite = true) {
  const path = `${__dirname}/${file}`

  ensureDirSync(dirname(path))

  if (!existsSync(path) || rewrite) {
    writeFileSync(path, content, {encoding: "utf8"});
  }

  return readFileSync(path, {encoding: "utf8"});
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
      projectPackageJson.setRaw({
        name: "",
        version: "1.0.0",
        description: "",
        scripts: {},
        dependencies: {},
        devDependencies: {}
      });

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
        "project-name/src/config",
        "project-name/src/config/env",
        "project-name/src/config/env/index.ts",
        "project-name/src/config/index.ts",
        "project-name/src/config/logger",
        "project-name/src/config/logger/index.ts",
        "project-name/src/controllers",
        "project-name/src/controllers/HelloWorldController.ts",
        "project-name/src/index.ts",
        "project-name/tsconfig.compile.json",
        "project-name/tsconfig.json"
      ]);

      const content = FakeCliFs.entries.get("project-name/src/Server.ts")!;
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
          build: "yarn run tsc",
          start: "tsnd --inspect --ignore-watch node_modules --respawn --transpile-only -r tsconfig-paths/register src/index.ts",
          "start:prod": "cross-env NODE_ENV=production node dist/index.js",
          tsc: "tsc --project tsconfig.compile.json",
          "tsc:w": "tsc --project tsconfig.json -w"
        },
        version: "1.0.0",
        tsed: {
          packageManager: "yarn"
        }
      });
    });
    it("should generate a project with swagger", async () => {
      const cliService = CliPlatformTest.get<CliService>(CliService);
      const projectPackageJson = CliPlatformTest.get<ProjectPackageJson>(ProjectPackageJson);
      projectPackageJson.setRaw({
        name: "",
        version: "1.0.0",
        description: "",
        scripts: {},
        dependencies: {},
        devDependencies: {}
      });

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
        "project-name/src/config",
        "project-name/src/config/env",
        "project-name/src/config/env/index.ts",
        "project-name/src/config/index.ts",
        "project-name/src/config/logger",
        "project-name/src/config/logger/index.ts",
        "project-name/src/controllers",
        "project-name/src/controllers/HelloWorldController.ts",
        "project-name/src/controllers/pages",
        "project-name/src/controllers/pages/IndexController.ts",
        "project-name/src/index.ts",
        "project-name/tsconfig.compile.json",
        "project-name/tsconfig.json",
        "project-name/views",
        "project-name/views/swagger.ejs"
      ]);

      const content = FakeCliFs.entries.get("project-name/src/Server.ts")!;

      expect(content).toContain("import {Configuration, Inject} from \"@tsed/di\"");
      expect(content).toContain("import \"@tsed/platform-express\"");
      expect(content).toContain("import \"@tsed/ajv\"");
      expect(content).toContain("import {IndexCtrl} from \"./controllers/pages/IndexController\"");
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
          build: "yarn run tsc",
          start: "tsnd --inspect --ignore-watch node_modules --respawn --transpile-only -r tsconfig-paths/register src/index.ts",
          "start:prod": "cross-env NODE_ENV=production node dist/index.js",
          tsc: "tsc --project tsconfig.compile.json",
          "tsc:w": "tsc --project tsconfig.json -w"
        },
        version: "1.0.0",
        tsed: {
          packageManager: "yarn"
        }
      });
    });
    it("should generate a project with NPM", async () => {
      const cliService = CliPlatformTest.get<CliService>(CliService);
      const projectPackageJson = CliPlatformTest.get<ProjectPackageJson>(ProjectPackageJson);
      projectPackageJson.setRaw({
        name: "",
        version: "1.0.0",
        description: "",
        scripts: {},
        dependencies: {},
        devDependencies: {}
      });

      await cliService.exec("init", {
        platform: "express",
        rootDir: "./project-data",
        projectName: "project-data",
        tsedVersion: "5.58.1",
        packageManager: PackageManager.NPM
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
        "project-name/src/config",
        "project-name/src/config/env",
        "project-name/src/config/env/index.ts",
        "project-name/src/config/index.ts",
        "project-name/src/config/logger",
        "project-name/src/config/logger/index.ts",
        "project-name/src/controllers",
        "project-name/src/controllers/HelloWorldController.ts",
        "project-name/src/index.ts",
        "project-name/tsconfig.compile.json",
        "project-name/tsconfig.json"
      ]);

      const content = FakeCliFs.entries.get("project-name/src/Server.ts")!;
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
          build: "npm run tsc",
          start: "tsnd --inspect --ignore-watch node_modules --respawn --transpile-only -r tsconfig-paths/register src/index.ts",
          "start:prod": "cross-env NODE_ENV=production node dist/index.js",
          tsc: "tsc --project tsconfig.compile.json",
          "tsc:w": "tsc --project tsconfig.json -w"
        },
        version: "1.0.0",
        tsed: {
          packageManager: "npm"
        }
      });
    });
    it("should generate a project with Convention ANGULAR", async () => {
      const cliService = CliPlatformTest.get<CliService>(CliService);
      const projectPackageJson = CliPlatformTest.get<ProjectPackageJson>(ProjectPackageJson);
      projectPackageJson.setRaw = (pkg) => {
        // @ts-ignore
        projectPackageJson.raw = {
          name: "",
          version: "1.0.0",
          description: "",
          scripts: {},
          dependencies: {},
          devDependencies: {},
          tsed: {
            convention: "angular"
          }
        }
      };

      await cliService.exec("init", {
        platform: "express",
        rootDir: "./project-data",
        projectName: "project-data",
        tsedVersion: "5.58.1",
        convention: ProjectConvention.ANGULAR,
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
        "project-name/src/config",
        "project-name/src/config/env",
        "project-name/src/config/env/index.ts",
        "project-name/src/config/index.ts",
        "project-name/src/config/logger",
        "project-name/src/config/logger/index.ts",
        "project-name/src/controllers",
        "project-name/src/controllers/hello-world.controller.ts",
        "project-name/src/controllers/pages",
        "project-name/src/controllers/pages/index.controller.ts",
        "project-name/src/index.ts",
        "project-name/src/server.ts",
        "project-name/tsconfig.compile.json",
        "project-name/tsconfig.json",
        "project-name/views",
        "project-name/views/swagger.ejs"
      ]);

      const content = FakeCliFs.entries.get("project-name/src/server.ts")!;
      expect(content).toContain("import {Configuration, Inject} from \"@tsed/di\"");
      expect(content).toContain("import \"@tsed/platform-express\"");
      expect(content).toContain("import \"@tsed/ajv\"");
      expect(content).toEqual(readFile("data/Server.express.ts.txt", content));
      expect(content).toContain("import {IndexCtrl} from \"./controllers/pages/index.controller\"");
      expect(content).toContain("export class Server {");
    });
  });

  describe("Koa.js", () => {
    it("should generate a project with the right options", async () => {
      const cliService = CliPlatformTest.get<CliService>(CliService);
      const projectPackageJson = CliPlatformTest.get<ProjectPackageJson>(ProjectPackageJson);
      projectPackageJson.setRaw({
        name: "",
        version: "1.0.0",
        description: "",
        scripts: {},
        dependencies: {},
        devDependencies: {}
      });

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
        "project-name/src/config",
        "project-name/src/config/env",
        "project-name/src/config/env/index.ts",
        "project-name/src/config/index.ts",
        "project-name/src/config/logger",
        "project-name/src/config/logger/index.ts",
        "project-name/src/controllers",
        "project-name/src/controllers/HelloWorldController.ts",
        "project-name/src/index.ts",
        "project-name/tsconfig.compile.json",
        "project-name/tsconfig.json"
      ]);

      const content = FakeCliFs.entries.get("project-name/src/Server.ts")!;

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
          build: "yarn run tsc",
          start: "tsnd --inspect --ignore-watch node_modules --respawn --transpile-only -r tsconfig-paths/register src/index.ts",
          "start:prod": "cross-env NODE_ENV=production node dist/index.js",
          tsc: "tsc --project tsconfig.compile.json",
          "tsc:w": "tsc --project tsconfig.json -w"
        },
        version: "1.0.0",
        tsed: {
          packageManager: "yarn"
        }
      });
    });
  });

  describe("shared configuration", () => {
    it("should configuration directory", async () => {
      const cliService = CliPlatformTest.get<CliService>(CliService);
      const projectPackageJson = CliPlatformTest.get<ProjectPackageJson>(ProjectPackageJson);
      projectPackageJson.setRaw({
        name: "",
        version: "1.0.0",
        description: "",
        scripts: {},
        dependencies: {},
        devDependencies: {}
      });

      await cliService.exec("init", {
        platform: "express",
        rootDir: "./project-data",
        projectName: "project-data",
        tsedVersion: "5.58.1",
        commands: true
      });

      try {
        FakeCliFs.getKeys().map((key: string) => {
          const content = FakeCliFs.entries.get(key)!

          if (content !== key) {
            writeFileSync(join(__dirname, "data", key), content, {encoding: "utf-8"})
          } else {
            ensureDirSync(join(__dirname, "data", key))
          }
        })
      } catch (er) {
      }


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
        "project-name/src/bin",
        "project-name/src/bin/HelloCommand.ts",
        "project-name/src/bin/index.ts",
        "project-name/src/config",
        "project-name/src/config/env",
        "project-name/src/config/env/index.ts",
        "project-name/src/config/index.ts",
        "project-name/src/config/logger",
        "project-name/src/config/logger/index.ts",
        "project-name/src/controllers",
        "project-name/src/controllers/HelloWorldController.ts",
        "project-name/src/index.ts",
        "project-name/tsconfig.compile.json",
        "project-name/tsconfig.json"
      ]);
    });
  })
});
