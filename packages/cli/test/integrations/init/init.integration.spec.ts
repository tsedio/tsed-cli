import {PackageManager} from "@tsed/cli-core";
import {CliPlatformTest, FakeCliFs} from "@tsed/cli-testing";
import {ensureDirSync, writeFileSync} from "fs-extra";
import {join} from "path";

import {ArchitectureConvention, InitCmd, ProjectConvention, TEMPLATE_DIR} from "../../../src/index.js";

const dir = import.meta.dirname;

describe("Init cmd", () => {
  beforeEach(() => {
    return CliPlatformTest.bootstrap({
      templateDir: TEMPLATE_DIR,
      commands: [InitCmd],
      argv: ["init"]
    });
  });
  afterEach(() => CliPlatformTest.reset());

  describe("Express.js", () => {
    it("should generate a project with the right options", async () => {
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
        rootDir: "./project-data",
        projectName: "project-data",
        tsedVersion: "5.58.1",
        packageManager: "yarn",
        runtime: "node"
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
          "project-name/tsconfig.base.json",
          "project-name/tsconfig.json",
          "project-name/tsconfig.node.json",
        ]
      `);

      const content = FakeCliFs.entries.get("project-name/src/Server.ts")!;
      expect(content).toContain('import {Configuration, Inject} from "@tsed/di"');
      expect(content).toContain('import "@tsed/platform-express"');
      expect(content).toContain('import "@tsed/ajv"');
      expect(content).toMatchSnapshot();

      const pkg = JSON.parse(FakeCliFs.entries.get("project-name/package.json")!);
      expect(pkg).toMatchInlineSnapshot(`
        {
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
            "@tsed/schema": "5.58.1",
          },
          "description": "",
          "devDependencies": {},
          "name": "project-data",
          "scripts": {
            "barrels": "barrels",
            "build": "yarn run barrels && swc src --out-dir dist -s",
            "start": "yarn run barrels && nodemon src/index.ts",
            "start:prod": "cross-env NODE_ENV=production node --import @swc-node/register/register-esm src/index.js",
          },
          "tsed": {
            "packageManager": "yarn",
            "runtime": "node",
          },
          "type": "module",
          "version": "1.0.0",
        }
      `);

      const dockerFile = FakeCliFs.entries.get("project-name/Dockerfile")!;

      expect(dockerFile).toContain(
        "COPY package.json yarn.lock tsconfig.json tsconfig.base.json tsconfig.node.json tsconfig.spec.json .barrels.json .swcrc ./"
      );
      expect(dockerFile).toContain("RUN yarn build");
      expect(dockerFile).toContain("RUN yarn install --pure-lockfile");

      const indexContent = FakeCliFs.entries.get("project-name/src/index.ts")!;
      expect(indexContent).toContain('import {Server} from "./Server.js"');
    });
    it("should generate a project with swagger", async () => {
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
        rootDir: "./project-data",
        projectName: "project-data",
        tsedVersion: "5.58.1",
        swagger: true
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
          "project-name/tsconfig.base.json",
          "project-name/tsconfig.json",
          "project-name/tsconfig.node.json",
          "project-name/views",
          "project-name/views/swagger.ejs",
        ]
      `);

      const content = FakeCliFs.entries.get("project-name/src/Server.ts")!;

      expect(content).toContain('import {Configuration, Inject} from "@tsed/di"');
      expect(content).toContain('import "@tsed/platform-express"');
      expect(content).toContain('import "@tsed/ajv"');
      expect(content).toContain('import * as pages from "./controllers/pages/index.js"');
      expect(content).toMatchSnapshot();

      const pkg = JSON.parse(FakeCliFs.entries.get("project-name/package.json")!);
      expect(pkg).toMatchInlineSnapshot(`
        {
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
            "@tsed/schema": "5.58.1",
          },
          "description": "",
          "devDependencies": {},
          "name": "project-data",
          "scripts": {
            "barrels": "barrels",
            "build": "yarn run barrels && swc src --out-dir dist -s",
            "start": "yarn run barrels && nodemon src/index.ts",
            "start:prod": "cross-env NODE_ENV=production node --import @swc-node/register/register-esm src/index.js",
          },
          "tsed": {
            "packageManager": "yarn",
            "runtime": "node",
          },
          "type": "module",
          "version": "1.0.0",
        }
      `);
    });
    it("should generate a project with Bun", async () => {
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
        rootDir: "./project-data",
        projectName: "project-data",
        tsedVersion: "5.58.1",
        runtime: "bun"
      });

      expect(FakeCliFs.getKeys()).toMatchInlineSnapshot(`
        [
          "project-name",
          "project-name/.barrels.json",
          "project-name/.dockerignore",
          "project-name/.gitignore",
          "project-name/Dockerfile",
          "project-name/README.md",
          "project-name/docker-compose.yml",
          "project-name/package.json",
          "project-name/processes.config.cjs",
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
          "project-name/tsconfig.base.json",
          "project-name/tsconfig.json",
          "project-name/tsconfig.node.json",
        ]
      `);

      const content = FakeCliFs.entries.get("project-name/src/Server.ts")!;
      expect(content).toContain('import {Configuration, Inject} from "@tsed/di"');
      expect(content).toContain('import "@tsed/platform-express"');
      expect(content).toContain('import "@tsed/ajv"');
      expect(content).toMatchSnapshot();

      const pkg = JSON.parse(FakeCliFs.entries.get("project-name/package.json")!);
      expect(pkg).toMatchInlineSnapshot(`
        {
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
            "@tsed/schema": "5.58.1",
          },
          "description": "",
          "devDependencies": {},
          "name": "project-data",
          "scripts": {
            "barrels": "barrels",
            "build": "bun run barrels && bun build --target=bun src/index.ts --outfile=dist/index.js",
            "start": "bun run barrels && bun --watch src/index.ts",
            "start:prod": "cross-env NODE_ENV=production bun dist/index.js",
          },
          "tsed": {
            "packageManager": "bun",
            "runtime": "bun",
          },
          "type": "module",
          "version": "1.0.0",
        }
      `);
    });
    it("should generate a project with Babel", async () => {
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
        rootDir: "./project-data",
        projectName: "project-data",
        tsedVersion: "5.58.1",
        runtime: "babel"
      });

      expect(FakeCliFs.getKeys()).toMatchInlineSnapshot(`
        [
          "project-name",
          "project-name/.babelrc",
          "project-name/.barrels.json",
          "project-name/.dockerignore",
          "project-name/.gitignore",
          "project-name/Dockerfile",
          "project-name/README.md",
          "project-name/docker-compose.yml",
          "project-name/package.json",
          "project-name/processes.config.cjs",
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
          "project-name/tsconfig.base.json",
          "project-name/tsconfig.json",
          "project-name/tsconfig.node.json",
        ]
      `);

      const content = FakeCliFs.entries.get("project-name/src/Server.ts")!;
      expect(content).toContain('import {Configuration, Inject} from "@tsed/di"');
      expect(content).toContain('import "@tsed/platform-express"');
      expect(content).toContain('import "@tsed/ajv"');
      expect(content).toMatchSnapshot();

      const pkg = JSON.parse(FakeCliFs.entries.get("project-name/package.json")!);
      expect(pkg).toMatchInlineSnapshot(`
        {
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
            "@tsed/schema": "5.58.1",
          },
          "description": "",
          "devDependencies": {},
          "name": "project-data",
          "scripts": {
            "barrels": "barrels",
            "build": "yarn run barrels && tsc && babel src --out-dir dist --extensions ".ts,.tsx" --source-maps inline",
            "start": "yarn run barrels && babel-watch --extensions .ts src/index.ts",
            "start:prod": "cross-env NODE_ENV=production node dist/index.js",
          },
          "tsed": {
            "packageManager": "yarn",
            "runtime": "babel",
          },
          "type": "module",
          "version": "1.0.0",
        }
      `);
    });
    it("should generate a project with Webpack", async () => {
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
        rootDir: "./project-data",
        projectName: "project-data",
        tsedVersion: "5.58.1",
        runtime: "webpack"
      });

      expect(FakeCliFs.getKeys()).toMatchInlineSnapshot(`
        [
          "project-name",
          "project-name/.babelrc",
          "project-name/.barrels.json",
          "project-name/.dockerignore",
          "project-name/.gitignore",
          "project-name/Dockerfile",
          "project-name/README.md",
          "project-name/docker-compose.yml",
          "project-name/package.json",
          "project-name/processes.config.cjs",
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
          "project-name/tsconfig.base.json",
          "project-name/tsconfig.json",
          "project-name/tsconfig.node.json",
          "project-name/webpack.config.js",
        ]
      `);

      const content = FakeCliFs.entries.get("project-name/src/Server.ts")!;
      expect(content).toContain('import {Configuration, Inject} from "@tsed/di"');
      expect(content).toContain('import "@tsed/platform-express"');
      expect(content).toContain('import "@tsed/ajv"');
      expect(content).toMatchSnapshot();

      const pkg = JSON.parse(FakeCliFs.entries.get("project-name/package.json")!);
      expect(pkg).toMatchInlineSnapshot(`
        {
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
            "@tsed/schema": "5.58.1",
          },
          "description": "",
          "devDependencies": {},
          "name": "project-data",
          "scripts": {
            "barrels": "barrels",
            "build": "yarn run barrels && tsc && cross-env NODE_ENV=production webpack",
            "start": "yarn run barrels && babel-watch --extensions .ts src/index.ts",
            "start:prod": "cross-env NODE_ENV=production node dist/app.bundle.js",
          },
          "tsed": {
            "packageManager": "yarn",
            "runtime": "webpack",
          },
          "type": "module",
          "version": "1.0.0",
        }
      `);
    });
    it("should generate a project with NPM", async () => {
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
        rootDir: "./project-data",
        projectName: "project-data",
        tsedVersion: "5.58.1",
        packageManager: PackageManager.NPM
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
          "project-name/tsconfig.base.json",
          "project-name/tsconfig.json",
          "project-name/tsconfig.node.json",
        ]
      `);

      const content = FakeCliFs.entries.get("project-name/src/Server.ts")!;
      expect(content).toContain('import {Configuration, Inject} from "@tsed/di"');
      expect(content).toContain('import "@tsed/platform-express"');
      expect(content).toContain('import "@tsed/ajv"');
      expect(content).toMatchSnapshot();

      const pkg = JSON.parse(FakeCliFs.entries.get("project-name/package.json")!);
      expect(pkg).toMatchInlineSnapshot(`
        {
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
            "@tsed/schema": "5.58.1",
          },
          "description": "",
          "devDependencies": {},
          "name": "project-data",
          "scripts": {
            "barrels": "barrels",
            "build": "npm run barrels && swc src --out-dir dist -s",
            "start": "npm run barrels && nodemon src/index.ts",
            "start:prod": "cross-env NODE_ENV=production node --import @swc-node/register/register-esm src/index.js",
          },
          "tsed": {
            "packageManager": "npm",
            "runtime": "node",
          },
          "type": "module",
          "version": "1.0.0",
        }
      `);
    });
    it("should generate a project with Convention ANGULAR", async () => {
      CliPlatformTest.setPackageJson({
        name: "",
        version: "1.0.0",
        description: "",
        scripts: {},
        dependencies: {},
        devDependencies: {},
        tsed: {
          convention: "angular"
        }
      });

      await CliPlatformTest.exec("init", {
        platform: "express",
        rootDir: "./project-data",
        projectName: "project-data",
        tsedVersion: "5.58.1",
        convention: ProjectConvention.ANGULAR,
        swagger: true
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
          "project-name/tsconfig.base.json",
          "project-name/tsconfig.json",
          "project-name/tsconfig.node.json",
          "project-name/views",
          "project-name/views/swagger.ejs",
        ]
      `);

      const content = FakeCliFs.entries.get("project-name/src/server.ts")!;
      expect(content).toContain('import {Configuration, Inject} from "@tsed/di"');
      expect(content).toContain('import "@tsed/platform-express"');
      expect(content).toContain('import "@tsed/ajv"');
      expect(content).toMatchSnapshot();
      expect(content).toContain('import * as pages from "./controllers/pages/index.js"');
      expect(content).toContain("export class Server {");

      const indexContent = FakeCliFs.entries.get("project-name/src/index.ts")!;
      expect(indexContent).toContain('import {Server} from "./server.js"');
    });
    it("should generate a project with Arch FEATURE", async () => {
      CliPlatformTest.setPackageJson({
        name: "",
        version: "1.0.0",
        description: "",
        scripts: {},
        dependencies: {},
        devDependencies: {},
        tsed: {}
      });

      await CliPlatformTest.exec("init", {
        platform: "express",
        rootDir: "./project-data",
        projectName: "project-data",
        tsedVersion: "5.58.1",
        convention: ProjectConvention.ANGULAR,
        architecture: ArchitectureConvention.FEATURE,
        swagger: true
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
          "project-name/src",
          "project-name/src/config",
          "project-name/src/config/envs",
          "project-name/src/config/envs/index.ts",
          "project-name/src/config/index.ts",
          "project-name/src/config/logger",
          "project-name/src/config/logger/index.ts",
          "project-name/src/index.ts",
          "project-name/src/pages",
          "project-name/src/pages/index.controller.ts",
          "project-name/src/rest",
          "project-name/src/rest/hello-world.controller.ts",
          "project-name/src/server.ts",
          "project-name/tsconfig.base.json",
          "project-name/tsconfig.json",
          "project-name/tsconfig.node.json",
          "project-name/views",
          "project-name/views/swagger.ejs",
        ]
      `);

      const content = FakeCliFs.entries.get("project-name/src/server.ts")!;
      expect(content).toContain('import {Configuration, Inject} from "@tsed/di"');
      expect(content).toContain('import "@tsed/platform-express"');
      expect(content).toContain('import "@tsed/ajv"');
      expect(content).toMatchSnapshot();
      expect(content).toContain('import * as pages from "./pages/index.js"');
      expect(content).toContain("export class Server {");

      const indexContent = FakeCliFs.entries.get("project-name/src/index.ts")!;
      expect(indexContent).toContain('import {Server} from "./server.js"');
    });
  });

  describe("Koa.js", () => {
    it("should generate a project with the right options", async () => {
      CliPlatformTest.setPackageJson({
        name: "",
        version: "1.0.0",
        description: "",
        scripts: {},
        dependencies: {},
        devDependencies: {}
      });

      await CliPlatformTest.exec("init", {
        platform: "koa",
        rootDir: "./project-data",
        projectName: "project-data",
        tsedVersion: "5.58.1"
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
          "project-name/tsconfig.base.json",
          "project-name/tsconfig.json",
          "project-name/tsconfig.node.json",
        ]
      `);

      const content = FakeCliFs.entries.get("project-name/src/Server.ts")!;

      expect(content).toContain('import {Configuration, Inject} from "@tsed/di"');
      expect(content).toContain('import "@tsed/platform-koa"');
      expect(content).toContain('import "@tsed/ajv"');
      expect(content).toMatchSnapshot();

      const pkg = JSON.parse(FakeCliFs.entries.get("project-name/package.json")!);
      expect(pkg).toMatchInlineSnapshot(`
        {
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
            "@tsed/schema": "5.58.1",
          },
          "description": "",
          "devDependencies": {},
          "name": "project-data",
          "scripts": {
            "barrels": "barrels",
            "build": "yarn run barrels && swc src --out-dir dist -s",
            "start": "yarn run barrels && nodemon src/index.ts",
            "start:prod": "cross-env NODE_ENV=production node --import @swc-node/register/register-esm src/index.js",
          },
          "tsed": {
            "packageManager": "yarn",
            "runtime": "node",
          },
          "type": "module",
          "version": "1.0.0",
        }
      `);
    });
  });
  describe("shared configuration", () => {
    it("should configuration directory", async () => {
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
        rootDir: "./project-data",
        projectName: "project-data",
        tsedVersion: "5.58.1",
        commands: true
      });

      try {
        FakeCliFs.getKeys().map((key: string) => {
          const content = FakeCliFs.entries.get(key)!;

          if (content !== key) {
            writeFileSync(join(dir, "data", key), content, {encoding: "utf-8"});
          } else {
            ensureDirSync(join(dir, "data", key));
          }
        });
      } catch (er) {}

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
          "project-name/tsconfig.base.json",
          "project-name/tsconfig.json",
          "project-name/tsconfig.node.json",
        ]
      `);
    });
  });
});
