import {CliService, PackageManager, ProjectPackageJson} from "@tsed/cli-core";
import {CliPlatformTest, FakeCliFs} from "@tsed/cli-testing";
import {ensureDirSync, existsSync, readFileSync, writeFileSync} from "fs-extra";
import {dirname, join} from "path";
import {InitCmd, ProjectConvention, TEMPLATE_DIR} from "../../../src";
import filedirname from "filedirname";

const [, dir] = filedirname();

describe("Init cmd", () => {
  beforeEach(() => {
      return CliPlatformTest.bootstrap({
        templateDir: TEMPLATE_DIR,
        commands: [InitCmd]
      });
    }
  );
  afterEach(() => CliPlatformTest.reset());

  describe("Express.js", () => {
    it("should generate a project with the right options", async () => {
      const cliService = CliPlatformTest.get<CliService>(CliService);
      const projectPackageJson = CliPlatformTest.get<ProjectPackageJson>(ProjectPackageJson);

      jest.spyOn(projectPackageJson as any, "getPackageJson").mockReturnValue({
        dependencies: {},
        devDependencies: {},
        scripts: {}
      });

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
        "project-name/.barrelsby.json",
        "project-name/.dockerignore",
        "project-name/.gitignore",
        "project-name/Dockerfile",
        "project-name/README.md",
        "project-name/docker-compose.yml",
        "project-name/package.json",
        "project-name/processes.config.js",
        "project-name/src",
        "project-name/src/Server.ts",
        "project-name/src/config",
        "project-name/src/config/envs",
        "project-name/src/config/envs/index.ts",
        "project-name/src/config/index.ts",
        "project-name/src/config/logger",
        "project-name/src/config/logger/index.ts",
        "project-name/src/controllers/rest",
        "project-name/src/controllers/rest/HelloWorldController.ts",
        "project-name/src/index.ts",
        "project-name/tsconfig.compile.json",
        "project-name/tsconfig.json"
      ]);

      const content = FakeCliFs.entries.get("project-name/src/Server.ts")!;
      expect(content).toContain("import {Configuration, Inject} from \"@tsed/di\"");
      expect(content).toContain("import \"@tsed/platform-express\"");
      expect(content).toContain("import \"@tsed/ajv\"");
      expect(content).toMatchSnapshot();

      const pkg = JSON.parse(FakeCliFs.entries.get("project-name/package.json")!);
      expect(pkg).toEqual({
        "dependencies": {
          "@tsed/ajv": "5.58.1",
          "@tsed/common": "5.58.1",
          "@tsed/core": "5.58.1",
          "@tsed/di": "5.58.1",
          "@tsed/exceptions": "5.58.1",
          "@tsed/json-mapper": "5.58.1",
          "@tsed/openspec": "5.58.1",
          "@tsed/platform-cache": "5.58.1",
          "@tsed/platform-exceptions": "5.58.1",
          "@tsed/platform-express": "5.58.1",
          "@tsed/platform-log-middleware": "5.58.1",
          "@tsed/platform-middlewares": "5.58.1",
          "@tsed/platform-params": "5.58.1",
          "@tsed/platform-response-filter": "5.58.1",
          "@tsed/platform-views": "5.58.1",
          "@tsed/schema": "5.58.1"
        },
        "description": "",
        "devDependencies": {},
        "name": "project-data",
        "scripts": {
          "barrels": "barrelsby --config .barrelsby.json",
          "build": "yarn run barrels && tsc --project tsconfig.compile.json",
          "start": "yarn run barrels && tsnd --inspect --exit-child --cls --ignore-watch node_modules --respawn --transpile-only -r tsconfig-paths/register src/index.ts",
          "start:prod": "cross-env NODE_ENV=production node dist/index.js"
        },
        "tsed": {
          "packageManager": "yarn"
        },
        "version": "1.0.0"
      });
    });
    it("should generate a project with swagger", async () => {
      const cliService = CliPlatformTest.get<CliService>(CliService);
      const projectPackageJson = CliPlatformTest.get<ProjectPackageJson>(ProjectPackageJson);

      jest.spyOn(projectPackageJson as any, "getPackageJson").mockReturnValue({
        dependencies: {},
        devDependencies: {},
        scripts: {}
      });

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
        "project-name/.barrelsby.json",
        "project-name/.dockerignore",
        "project-name/.gitignore",
        "project-name/Dockerfile",
        "project-name/README.md",
        "project-name/docker-compose.yml",
        "project-name/package.json",
        "project-name/processes.config.js",
        "project-name/src",
        "project-name/src/Server.ts",
        "project-name/src/config",
        "project-name/src/config/envs",
        "project-name/src/config/envs/index.ts",
        "project-name/src/config/index.ts",
        "project-name/src/config/logger",
        "project-name/src/config/logger/index.ts",
        "project-name/src/controllers/pages",
        "project-name/src/controllers/pages/IndexController.ts",
        "project-name/src/controllers/rest",
        "project-name/src/controllers/rest/HelloWorldController.ts",
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
      expect(content).toContain("import * as pages from \"./controllers/pages/index\"");
      expect(content).toMatchSnapshot();

      const pkg = JSON.parse(FakeCliFs.entries.get("project-name/package.json")!);
      expect(pkg).toEqual({
        "dependencies": {
          "@tsed/ajv": "5.58.1",
          "@tsed/common": "5.58.1",
          "@tsed/core": "5.58.1",
          "@tsed/di": "5.58.1",
          "@tsed/exceptions": "5.58.1",
          "@tsed/json-mapper": "5.58.1",
          "@tsed/openspec": "5.58.1",
          "@tsed/platform-cache": "5.58.1",
          "@tsed/platform-exceptions": "5.58.1",
          "@tsed/platform-express": "5.58.1",
          "@tsed/platform-log-middleware": "5.58.1",
          "@tsed/platform-middlewares": "5.58.1",
          "@tsed/platform-params": "5.58.1",
          "@tsed/platform-response-filter": "5.58.1",
          "@tsed/platform-views": "5.58.1",
          "@tsed/schema": "5.58.1"
        },
        "description": "",
        "devDependencies": {},
        "name": "project-data",
        "scripts": {
          "barrels": "barrelsby --config .barrelsby.json",
          "build": "yarn run barrels && tsc --project tsconfig.compile.json",
          "start": "yarn run barrels && tsnd --inspect --exit-child --cls --ignore-watch node_modules --respawn --transpile-only -r tsconfig-paths/register src/index.ts",
          "start:prod": "cross-env NODE_ENV=production node dist/index.js"
        },
        "tsed": {
          "packageManager": "yarn"
        },
        "version": "1.0.0"
      });
    });
    it("should generate a project with NPM", async () => {
      const cliService = CliPlatformTest.get<CliService>(CliService);
      const projectPackageJson = CliPlatformTest.get<ProjectPackageJson>(ProjectPackageJson);

      jest.spyOn(projectPackageJson as any, "getPackageJson").mockReturnValue({
        dependencies: {},
        devDependencies: {},
        scripts: {}
      });

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
        "project-name/.barrelsby.json",
        "project-name/.dockerignore",
        "project-name/.gitignore",
        "project-name/Dockerfile",
        "project-name/README.md",
        "project-name/docker-compose.yml",
        "project-name/package.json",
        "project-name/processes.config.js",
        "project-name/src",
        "project-name/src/Server.ts",
        "project-name/src/config",
        "project-name/src/config/envs",
        "project-name/src/config/envs/index.ts",
        "project-name/src/config/index.ts",
        "project-name/src/config/logger",
        "project-name/src/config/logger/index.ts",
        "project-name/src/controllers/rest",
        "project-name/src/controllers/rest/HelloWorldController.ts",
        "project-name/src/index.ts",
        "project-name/tsconfig.compile.json",
        "project-name/tsconfig.json"
      ]);

      const content = FakeCliFs.entries.get("project-name/src/Server.ts")!;
      expect(content).toContain("import {Configuration, Inject} from \"@tsed/di\"");
      expect(content).toContain("import \"@tsed/platform-express\"");
      expect(content).toContain("import \"@tsed/ajv\"");
      expect(content).toMatchSnapshot();

      const pkg = JSON.parse(FakeCliFs.entries.get("project-name/package.json")!);
      expect(pkg).toEqual({
        "dependencies": {
          "@tsed/ajv": "5.58.1",
          "@tsed/common": "5.58.1",
          "@tsed/core": "5.58.1",
          "@tsed/di": "5.58.1",
          "@tsed/exceptions": "5.58.1",
          "@tsed/json-mapper": "5.58.1",
          "@tsed/openspec": "5.58.1",
          "@tsed/platform-cache": "5.58.1",
          "@tsed/platform-exceptions": "5.58.1",
          "@tsed/platform-express": "5.58.1",
          "@tsed/platform-log-middleware": "5.58.1",
          "@tsed/platform-middlewares": "5.58.1",
          "@tsed/platform-params": "5.58.1",
          "@tsed/platform-response-filter": "5.58.1",
          "@tsed/platform-views": "5.58.1",
          "@tsed/schema": "5.58.1"
        },
        "description": "",
        "devDependencies": {},
        "name": "project-data",
        "scripts": {
          "barrels": "barrelsby --config .barrelsby.json",
          "build": "npm run barrels && tsc --project tsconfig.compile.json",
          "start": "npm run barrels && tsnd --inspect --exit-child --cls --ignore-watch node_modules --respawn --transpile-only -r tsconfig-paths/register src/index.ts",
          "start:prod": "cross-env NODE_ENV=production node dist/index.js"
        },
        "tsed": {
          "packageManager": "npm"
        },
        "version": "1.0.0"
      });
    });
    it("should generate a project with Convention ANGULAR", async () => {
      const cliService = CliPlatformTest.get<CliService>(CliService);
      const projectPackageJson = CliPlatformTest.get<ProjectPackageJson>(ProjectPackageJson);

      jest.spyOn(projectPackageJson as any, "getPackageJson").mockReturnValue({
        dependencies: {},
        devDependencies: {},
        scripts: {}
      });

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
        "project-name/.barrelsby.json",
        "project-name/.dockerignore",
        "project-name/.gitignore",
        "project-name/Dockerfile",
        "project-name/README.md",
        "project-name/docker-compose.yml",
        "project-name/package.json",
        "project-name/processes.config.js",
        "project-name/src",
        "project-name/src/config",
        "project-name/src/config/envs",
        "project-name/src/config/envs/index.ts",
        "project-name/src/config/index.ts",
        "project-name/src/config/logger",
        "project-name/src/config/logger/index.ts",
        "project-name/src/controllers/pages",
        "project-name/src/controllers/pages/index.controller.ts",
        "project-name/src/controllers/rest",
        "project-name/src/controllers/rest/hello-world.controller.ts",
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
      expect(content).toMatchSnapshot();
      expect(content).toContain("import * as pages from \"./controllers/pages/index\"");
      expect(content).toContain("export class Server {");
    });
  });

  describe("Koa.js", () => {
    it("should generate a project with the right options", async () => {
      const cliService = CliPlatformTest.get<CliService>(CliService);
      const projectPackageJson = CliPlatformTest.get<ProjectPackageJson>(ProjectPackageJson);

      jest.spyOn(projectPackageJson as any, "getPackageJson").mockReturnValue({
        dependencies: {},
        devDependencies: {},
        scripts: {}
      });

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
        "project-name/.barrelsby.json",
        "project-name/.dockerignore",
        "project-name/.gitignore",
        "project-name/Dockerfile",
        "project-name/README.md",
        "project-name/docker-compose.yml",
        "project-name/package.json",
        "project-name/processes.config.js",
        "project-name/src",
        "project-name/src/Server.ts",
        "project-name/src/config",
        "project-name/src/config/envs",
        "project-name/src/config/envs/index.ts",
        "project-name/src/config/index.ts",
        "project-name/src/config/logger",
        "project-name/src/config/logger/index.ts",
        "project-name/src/controllers/rest",
        "project-name/src/controllers/rest/HelloWorldController.ts",
        "project-name/src/index.ts",
        "project-name/tsconfig.compile.json",
        "project-name/tsconfig.json"
      ]);

      const content = FakeCliFs.entries.get("project-name/src/Server.ts")!;

      expect(content).toContain("import {Configuration, Inject} from \"@tsed/di\"");
      expect(content).toContain("import \"@tsed/platform-koa\"");
      expect(content).toContain("import \"@tsed/ajv\"");
      expect(content).toMatchSnapshot();

      const pkg = JSON.parse(FakeCliFs.entries.get("project-name/package.json")!);
      expect(pkg).toEqual({
        "dependencies": {
          "@tsed/ajv": "5.58.1",
          "@tsed/common": "5.58.1",
          "@tsed/core": "5.58.1",
          "@tsed/di": "5.58.1",
          "@tsed/exceptions": "5.58.1",
          "@tsed/json-mapper": "5.58.1",
          "@tsed/openspec": "5.58.1",
          "@tsed/platform-cache": "5.58.1",
          "@tsed/platform-exceptions": "5.58.1",
          "@tsed/platform-koa": "5.58.1",
          "@tsed/platform-log-middleware": "5.58.1",
          "@tsed/platform-middlewares": "5.58.1",
          "@tsed/platform-params": "5.58.1",
          "@tsed/platform-response-filter": "5.58.1",
          "@tsed/platform-views": "5.58.1",
          "@tsed/schema": "5.58.1"
        },
        "description": "",
        "devDependencies": {},
        "name": "project-data",
        "scripts": {
          "barrels": "barrelsby --config .barrelsby.json",
          "build": "yarn run barrels && tsc --project tsconfig.compile.json",
          "start": "yarn run barrels && tsnd --inspect --exit-child --cls --ignore-watch node_modules --respawn --transpile-only -r tsconfig-paths/register src/index.ts",
          "start:prod": "cross-env NODE_ENV=production node dist/index.js"
        },
        "tsed": {
          "packageManager": "yarn"
        },
        "version": "1.0.0"
      });
    });
  });

  describe("shared configuration", () => {
    it("should configuration directory", async () => {
      const cliService = CliPlatformTest.get<CliService>(CliService);
      const projectPackageJson = CliPlatformTest.get<ProjectPackageJson>(ProjectPackageJson);

      jest.spyOn(projectPackageJson as any, "getPackageJson").mockReturnValue({
        dependencies: {},
        devDependencies: {},
        scripts: {}
      });

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
            writeFileSync(join(dir, "data", key), content, {encoding: "utf-8"})
          } else {
            ensureDirSync(join(dir, "data", key))
          }
        })
      } catch (er) {
      }

      expect(FakeCliFs.getKeys()).toEqual([
        "./project-name",
        "project-name",
        "project-name/.barrelsby.json",
        "project-name/.dockerignore",
        "project-name/.gitignore",
        "project-name/Dockerfile",
        "project-name/README.md",
        "project-name/docker-compose.yml",
        "project-name/package.json",
        "project-name/processes.config.js",
        "project-name/src",
        "project-name/src/Server.ts",
        "project-name/src/bin",
        "project-name/src/bin/HelloCommand.ts",
        "project-name/src/bin/index.ts",
        "project-name/src/config",
        "project-name/src/config/envs",
        "project-name/src/config/envs/index.ts",
        "project-name/src/config/index.ts",
        "project-name/src/config/logger",
        "project-name/src/config/logger/index.ts",
        "project-name/src/controllers/rest",
        "project-name/src/controllers/rest/HelloWorldController.ts",
        "project-name/src/index.ts",
        "project-name/tsconfig.compile.json",
        "project-name/tsconfig.json"
      ]);
    });
  })
});
