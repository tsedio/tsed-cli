import {join} from "node:path";

import {PackageManager, ProjectPackageJson} from "@tsed/cli-core";
// @ts-ignore
import {CliPlatformTest, FakeCliFs} from "@tsed/cli-testing";
import {DIContext, inject, runInContext} from "@tsed/di";
import {ensureDirSync, writeFileSync} from "fs-extra";

import {ArchitectureConvention, CliTemplatesService, FeatureType, InitCmd, ProjectConvention, TEMPLATE_DIR} from "../../../src/index.js";

const dir = import.meta.dirname;

describe("Init cmd", () => {
  beforeEach(() => {
    return CliPlatformTest.bootstrap({
      templateDir: TEMPLATE_DIR,
      commands: [InitCmd],
      argv: ["init"],
      logger: {
        level: "info"
      }
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

      await CliPlatformTest.initProject({
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
          "project-name/tsconfig.spec.json",
        ]
      `);

      const content = FakeCliFs.files.get("project-name/src/Server.ts")!;

      expect(content).toContain('import { application } from "@tsed/platform-http"');
      expect(content).toContain('import "@tsed/platform-express"');
      expect(content).toContain('import "@tsed/ajv"');
      expect(content).toMatchSnapshot();

      expect(FakeCliFs.files.get("project-name/.barrels.json")).toMatchInlineSnapshot(`
        "{
          "directory": [
            "./src/controllers/rest"
          ],
          "exclude": [
            "**/__mock__",
            "**/__mocks__",
            "**/*.spec.ts"
          ],
          "delete": true
        }"
      `);

      const pkg = JSON.parse(FakeCliFs.files.get("project-name/package.json")!);
      expect(pkg).toMatchInlineSnapshot(`
        {
          "dependencies": {
            "@tsed/ajv": "5.58.1",
            "@tsed/config": "5.58.1",
            "@tsed/core": "5.58.1",
            "@tsed/di": "5.58.1",
            "@tsed/exceptions": "5.58.1",
            "@tsed/json-mapper": "5.58.1",
            "@tsed/openspec": "5.58.1",
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
          },
          "description": "",
          "devDependencies": {},
          "name": "project-data",
          "scripts": {
            "barrels": "barrels",
            "build": "yarn run barrels && swc src --out-dir dist -s  --strip-leading-paths",
            "start": "yarn run barrels && nodemon src/index.ts",
            "start:prod": "cross-env NODE_ENV=production node --import @swc-node/register/esm-register src/index.js",
          },
          "tsed": {
            "packageManager": "yarn",
            "platform": "express",
            "runtime": "node",
          },
          "type": "module",
          "version": "1.0.0",
        }
      `);

      const dockerFile = FakeCliFs.files.get("project-name/Dockerfile")!;

      expect(dockerFile).toContain(
        "COPY package.json yarn.lock tsconfig.json tsconfig.base.json tsconfig.node.json tsconfig.spec.json .barrels.json .swcrc ./"
      );
      expect(dockerFile).toContain("RUN yarn build");
      expect(dockerFile).toContain("RUN yarn install --pure-lockfile");

      const indexContent = FakeCliFs.files.get("project-name/src/index.ts")!;
      expect(indexContent).toContain('import { Server } from "./Server.js"');

      const configContent = FakeCliFs.files.get("project-name/src/config/config.ts")!;
      expect(configContent).toMatchSnapshot("config file content");

      const tsconfigContent: any = FakeCliFs.files.get("project-name/tsconfig.json")!;
      expect(tsconfigContent.toString("utf8")).toMatchInlineSnapshot(`
        "{
          "extends": "./tsconfig.base.json",
          "references": [
            {
              "path": "./tsconfig.node.json"
            },
            {
              "path": "./tsconfig.spec.json"
            }
          ]
        }
        "
      `);

      const tsconfigNodeContent: any = FakeCliFs.files.get("project-name/tsconfig.node.json")!;
      expect(tsconfigNodeContent.toString("utf8")).toMatchInlineSnapshot(`
        "{
          "extends": "./tsconfig.base.json",
          "compilerOptions": {
            "baseUrl": ".",
            "paths": {
              "@/*": ["src/*"]
            }
          },
          "include": ["src/**/*", ".templates/**/*"],
          "exclude": ["src/**/*.spec.ts", "dist", "node_modules", "**/helpers/*Fixture.ts", "**/__mock__/**", "coverage"],
          "linterOptions": {
            "exclude": []
          }
        }
        "
      `);
    });
    it("should generate a project with the many config source", async () => {
      CliPlatformTest.setPackageJson({
        name: "",
        version: "1.0.0",
        description: "",
        scripts: {},
        dependencies: {},
        devDependencies: {}
      });

      await CliPlatformTest.initProject({
        platform: "express",
        rootDir: "./project-data",
        projectName: "project-data",
        tsedVersion: "5.58.1",
        packageManager: "yarn",
        runtime: "node",
        verbose: false,
        root: ".",
        arch: "arc_default",
        convention: "conv_default",
        skipPrompt: false,
        rawArgs: [],
        architecture: "arc_default",
        commandName: "init",
        features: [
          "config",
          "config:envs",
          FeatureType.CONFIG_DOTENV,
          FeatureType.CONFIG_JSON,
          FeatureType.CONFIG_YAML,
          FeatureType.CONFIG_AWS_SECRETS,
          FeatureType.CONFIG_VAULT,
          FeatureType.CONFIG_IOREDIS,
          FeatureType.CONFIG_MONGO,
          FeatureType.CONFIG_POSTGRES
        ],
        json: true,
        node: true,
        babel: false,
        webpack: false,
        bun: false,
        npm: true,
        yarn_berry: false,
        yarn: false,
        cliVersion: "6.6.3",
        srcDir: "src",
        bindLogger: true,
        compiled: true
      });

      expect(FakeCliFs.getKeys()).toMatchInlineSnapshot(`
        [
          "project-name",
          "project-name/.barrels.json",
          "project-name/.dockerignore",
          "project-name/.gitignore",
          "project-name/.npmrc",
          "project-name/.swcrc",
          "project-name/.yarnrc",
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
          "project-name/tsconfig.spec.json",
        ]
      `);

      const content = FakeCliFs.files.get("project-name/src/Server.ts")!;

      expect(content).toContain('import { application } from "@tsed/platform-http"');
      expect(content).toContain('import "@tsed/platform-express"');
      expect(content).toContain('import "@tsed/ajv"');
      expect(content).toMatchSnapshot();

      expect(FakeCliFs.files.get("project-name/.barrels.json")).toMatchInlineSnapshot(`
        "{
          "directory": [
            "./src/controllers/rest"
          ],
          "exclude": [
            "**/__mock__",
            "**/__mocks__",
            "**/*.spec.ts"
          ],
          "delete": true
        }"
      `);

      expect(inject(ProjectPackageJson).dependencies).toMatchInlineSnapshot(`
        {
          "@aws-sdk/client-secrets-manager": "latest",
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
          "@tsed/ioredis": "5.58.1",
          "@tsed/json-mapper": "5.58.1",
          "@tsed/logger": "latest",
          "@tsed/logger-std": "latest",
          "@tsed/openspec": "5.58.1",
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
          "@tsedio/config-ioredis": "5.58.1",
          "@tsedio/config-mongo": "latest",
          "@tsedio/config-postgres": "latest",
          "@tsedio/config-source-aws-secrets": "latest",
          "@tsedio/config-vault": "latest",
          "ajv": "latest",
          "body-parser": "latest",
          "compression": "latest",
          "cookie-parser": "latest",
          "cors": "latest",
          "cross-env": "latest",
          "dotenv": "latest",
          "dotenv-expand": "latest",
          "dotenv-flow": "latest",
          "express": "latest",
          "ioredis": "latest",
          "js-yaml": "latest",
          "method-override": "latest",
          "mongodb": "latest",
          "node-vault": "latest",
          "pg": "latest",
          "typescript": "latest",
        }
      `);
      expect(inject(ProjectPackageJson).devDependencies).toMatchInlineSnapshot(`
        {
          "@tsedio/testcontainers-redis": "latest",
          "@types/compression": "latest",
          "@types/cookie-parser": "latest",
          "@types/cors": "latest",
          "@types/express": "latest",
          "@types/method-override": "latest",
          "@types/multer": "latest",
          "@types/node": "latest",
          "nodemon": "latest",
          "tslib": "latest",
        }
      `);

      const dockerFile = FakeCliFs.files.get("project-name/Dockerfile")!;

      expect(dockerFile).toContain(
        "COPY package.json yarn.lock tsconfig.json tsconfig.base.json tsconfig.node.json tsconfig.spec.json .barrels.json .swcrc ./"
      );
      expect(dockerFile).toContain("RUN yarn build");
      expect(dockerFile).toContain("RUN yarn install --pure-lockfile");

      const indexContent = FakeCliFs.files.get("project-name/src/index.ts")!;
      expect(indexContent).toContain('import { Server } from "./Server.js"');

      const configContent = FakeCliFs.files.get("project-name/src/config/config.ts")!;

      expect(configContent).toMatchSnapshot("config file content");

      const npmrcContent: any = FakeCliFs.files.get("project-name/.npmrc");
      expect(npmrcContent.toString("utf8")).toMatchInlineSnapshot(`
        "@tsedio:registry=https://npm.pkg.github.com
        //npm.pkg.github.com/:_authToken=\${GH_TOKEN}
        "
      `);
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

      await CliPlatformTest.initProject({
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
          "project-name/tsconfig.spec.json",
          "project-name/views",
          "project-name/views/swagger.ejs",
        ]
      `);

      expect(FakeCliFs.files.get("project-name/.barrels.json")).toMatchInlineSnapshot(`
        "{
          "directory": [
            "./src/controllers/rest",
            "./src/controllers/pages"
          ],
          "exclude": [
            "**/__mock__",
            "**/__mocks__",
            "**/*.spec.ts"
          ],
          "delete": true
        }"
      `);

      const content = FakeCliFs.files.get("project-name/src/Server.ts")!;

      expect(content).toContain('import { application } from "@tsed/platform-http"');
      expect(content).toContain('import "@tsed/platform-express"');
      expect(content).toContain('import "@tsed/ajv"');
      expect(content).toContain('import * as pages from "./controllers/pages/index.js"');
      expect(content).toMatchSnapshot();

      const pkg = JSON.parse(FakeCliFs.files.get("project-name/package.json")!);
      expect(pkg).toMatchInlineSnapshot(`
        {
          "dependencies": {
            "@tsed/ajv": "5.58.1",
            "@tsed/config": "5.58.1",
            "@tsed/core": "5.58.1",
            "@tsed/di": "5.58.1",
            "@tsed/exceptions": "5.58.1",
            "@tsed/json-mapper": "5.58.1",
            "@tsed/openspec": "5.58.1",
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
          },
          "description": "",
          "devDependencies": {},
          "name": "project-data",
          "scripts": {
            "barrels": "barrels",
            "build": "yarn run barrels && swc src --out-dir dist -s  --strip-leading-paths",
            "start": "yarn run barrels && nodemon src/index.ts",
            "start:prod": "cross-env NODE_ENV=production node --import @swc-node/register/esm-register src/index.js",
          },
          "tsed": {
            "packageManager": "yarn",
            "platform": "express",
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

      await CliPlatformTest.initProject({
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
          "project-name/tsconfig.spec.json",
        ]
      `);

      const content = FakeCliFs.files.get("project-name/src/Server.ts")!;
      expect(content).toContain('import { application } from "@tsed/platform-http"');
      expect(content).toContain('import "@tsed/platform-express"');
      expect(content).toContain('import "@tsed/ajv"');
      expect(content).toMatchSnapshot();

      const pkg = JSON.parse(FakeCliFs.files.get("project-name/package.json")!);
      expect(pkg).toMatchInlineSnapshot(`
        {
          "dependencies": {
            "@tsed/ajv": "5.58.1",
            "@tsed/config": "5.58.1",
            "@tsed/core": "5.58.1",
            "@tsed/di": "5.58.1",
            "@tsed/exceptions": "5.58.1",
            "@tsed/json-mapper": "5.58.1",
            "@tsed/openspec": "5.58.1",
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
            "platform": "express",
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

      await CliPlatformTest.initProject({
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
          "project-name/tsconfig.spec.json",
        ]
      `);

      const content = FakeCliFs.files.get("project-name/src/Server.ts")!;
      expect(content).toContain('import { application } from "@tsed/platform-http"');
      expect(content).toContain('import "@tsed/platform-express"');
      expect(content).toContain('import "@tsed/ajv"');
      expect(content).toMatchSnapshot();

      const pkg = JSON.parse(FakeCliFs.files.get("project-name/package.json")!);
      expect(pkg).toMatchInlineSnapshot(`
        {
          "dependencies": {
            "@tsed/ajv": "5.58.1",
            "@tsed/config": "5.58.1",
            "@tsed/core": "5.58.1",
            "@tsed/di": "5.58.1",
            "@tsed/exceptions": "5.58.1",
            "@tsed/json-mapper": "5.58.1",
            "@tsed/openspec": "5.58.1",
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
            "platform": "express",
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

      await CliPlatformTest.initProject({
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
          "project-name/tsconfig.spec.json",
          "project-name/webpack.config.js",
        ]
      `);

      const content = FakeCliFs.files.get("project-name/src/Server.ts")!;
      expect(content).toContain('import { application } from "@tsed/platform-http"');
      expect(content).toContain('import "@tsed/platform-express"');
      expect(content).toContain('import "@tsed/ajv"');
      expect(content).toMatchSnapshot();

      const pkg = JSON.parse(FakeCliFs.files.get("project-name/package.json")!);
      expect(pkg).toMatchInlineSnapshot(`
        {
          "dependencies": {
            "@tsed/ajv": "5.58.1",
            "@tsed/config": "5.58.1",
            "@tsed/core": "5.58.1",
            "@tsed/di": "5.58.1",
            "@tsed/exceptions": "5.58.1",
            "@tsed/json-mapper": "5.58.1",
            "@tsed/openspec": "5.58.1",
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
            "platform": "express",
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

      await CliPlatformTest.initProject({
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
          "project-name/tsconfig.spec.json",
        ]
      `);

      const content = FakeCliFs.files.get("project-name/src/Server.ts")!;
      expect(content).toContain('import { application } from "@tsed/platform-http"');
      expect(content).toContain('import "@tsed/platform-express"');
      expect(content).toContain('import "@tsed/ajv"');
      expect(content).toMatchSnapshot();

      const pkg = JSON.parse(FakeCliFs.files.get("project-name/package.json")!);
      expect(pkg).toMatchInlineSnapshot(`
        {
          "dependencies": {
            "@tsed/ajv": "5.58.1",
            "@tsed/config": "5.58.1",
            "@tsed/core": "5.58.1",
            "@tsed/di": "5.58.1",
            "@tsed/exceptions": "5.58.1",
            "@tsed/json-mapper": "5.58.1",
            "@tsed/openspec": "5.58.1",
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
          },
          "description": "",
          "devDependencies": {},
          "name": "project-data",
          "scripts": {
            "barrels": "barrels",
            "build": "npm run barrels && swc src --out-dir dist -s  --strip-leading-paths",
            "start": "npm run barrels && nodemon src/index.ts",
            "start:prod": "cross-env NODE_ENV=production node --import @swc-node/register/esm-register src/index.js",
          },
          "tsed": {
            "packageManager": "npm",
            "platform": "express",
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

      await CliPlatformTest.initProject({
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
          "project-name/src/config/config.ts",
          "project-name/src/config/logger/index.ts",
          "project-name/src/config/utils/index.ts",
          "project-name/src/controllers/pages/index.controller.ts",
          "project-name/src/controllers/rest/hello-world.controller.ts",
          "project-name/src/index.ts",
          "project-name/src/server.ts",
          "project-name/tsconfig.base.json",
          "project-name/tsconfig.json",
          "project-name/tsconfig.node.json",
          "project-name/tsconfig.spec.json",
          "project-name/views",
          "project-name/views/swagger.ejs",
        ]
      `);

      const content = FakeCliFs.files.get("project-name/src/server.ts")!;
      expect(content).toContain('import { application } from "@tsed/platform-http"');
      expect(content).toContain('import "@tsed/platform-express"');
      expect(content).toContain('import "@tsed/ajv"');
      expect(content).toMatchSnapshot();
      expect(content).toContain('import * as pages from "./controllers/pages/index.js"');
      expect(content).toContain("export class Server {");

      const indexContent = FakeCliFs.files.get("project-name/src/index.ts")!;
      expect(indexContent).toContain('import { Server } from "./server.js"');
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

      const $ctx = new DIContext({
        id: ""
      });

      await runInContext($ctx, async () => {
        await CliPlatformTest.initProject({
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
          "project-name/src/config/config.ts",
          "project-name/src/config/logger/index.ts",
          "project-name/src/config/utils/index.ts",
          "project-name/src/index.controller.ts",
          "project-name/src/index.ts",
          "project-name/src/rest/hello-world.controller.ts",
          "project-name/src/server.ts",
          "project-name/tsconfig.base.json",
          "project-name/tsconfig.json",
          "project-name/tsconfig.node.json",
          "project-name/tsconfig.spec.json",
          "project-name/views",
          "project-name/views/swagger.ejs",
        ]
      `);

        const content = FakeCliFs.files.get("project-name/src/server.ts")!;
        expect(content).toContain('import { application } from "@tsed/platform-http"');
        expect(content).toContain('import "@tsed/platform-express"');
        expect(content).toContain('import "@tsed/ajv"');
        expect(content).toMatchSnapshot();
        expect(content).toContain('import * as pages from "./pages/index.js"');
        expect(content).toContain("export class Server {");

        const indexContent = FakeCliFs.files.get("project-name/src/index.ts")!;
        expect(indexContent).toContain('import { Server } from "./server.js"');

        const resultFiles = inject(CliTemplatesService)
          .getRenderedFiles()
          .map((f) => f.outputPath);

        expect(resultFiles.sort()).toMatchInlineSnapshot(`
        [
          ".barrels.json",
          ".dockerignore",
          ".gitignore",
          ".swcrc",
          "/views/swagger.ejs",
          "Dockerfile",
          "README.md",
          "docker-compose.yml",
          "nodemon.json",
          "processes.config.cjs",
          "src/config/config.ts",
          "src/config/logger/index.ts",
          "src/config/utils/index.ts",
          "src/index.controller.ts",
          "src/index.ts",
          "src/rest/hello-world.controller.ts",
          "src/server.ts",
          "tsconfig.base.json",
          "tsconfig.json",
          "tsconfig.node.json",
          "tsconfig.spec.json",
        ]
      `);
      });
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

      await CliPlatformTest.initProject({
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
          "project-name/tsconfig.spec.json",
        ]
      `);

      const content = FakeCliFs.files.get("project-name/src/Server.ts")!;

      expect(content).toContain('import { application } from "@tsed/platform-http"');
      expect(content).toContain('import "@tsed/platform-koa"');
      expect(content).toContain('import "@tsed/ajv"');
      expect(content).toMatchSnapshot();

      const pkg = JSON.parse(FakeCliFs.files.get("project-name/package.json")!);
      expect(pkg).toMatchInlineSnapshot(`
        {
          "dependencies": {
            "@tsed/ajv": "5.58.1",
            "@tsed/config": "5.58.1",
            "@tsed/core": "5.58.1",
            "@tsed/di": "5.58.1",
            "@tsed/exceptions": "5.58.1",
            "@tsed/json-mapper": "5.58.1",
            "@tsed/openspec": "5.58.1",
            "@tsed/platform-cache": "5.58.1",
            "@tsed/platform-exceptions": "5.58.1",
            "@tsed/platform-http": "5.58.1",
            "@tsed/platform-koa": "5.58.1",
            "@tsed/platform-log-request": "5.58.1",
            "@tsed/platform-middlewares": "5.58.1",
            "@tsed/platform-multer": "5.58.1",
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
            "build": "yarn run barrels && swc src --out-dir dist -s  --strip-leading-paths",
            "start": "yarn run barrels && nodemon src/index.ts",
            "start:prod": "cross-env NODE_ENV=production node --import @swc-node/register/esm-register src/index.js",
          },
          "tsed": {
            "packageManager": "yarn",
            "platform": "koa",
            "runtime": "node",
          },
          "type": "module",
          "version": "1.0.0",
        }
      `);
    });
  });
  describe("Fastify.js", () => {
    it("should generate a project with the right options", async () => {
      CliPlatformTest.setPackageJson({
        name: "",
        version: "1.0.0",
        description: "",
        scripts: {},
        dependencies: {},
        devDependencies: {}
      });

      await CliPlatformTest.initProject({
        platform: "fastify",
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
          "project-name/tsconfig.spec.json",
        ]
      `);

      const content = FakeCliFs.files.get("project-name/src/Server.ts")!;

      expect(content).toContain('import { application } from "@tsed/platform-http"');
      expect(content).toContain('import "@tsed/platform-fastify"');
      expect(content).toContain('import "@tsed/ajv"');
      expect(content).toMatchSnapshot();

      const pkg = JSON.parse(FakeCliFs.files.get("project-name/package.json")!);
      expect(pkg).toMatchInlineSnapshot(`
        {
          "dependencies": {
            "@tsed/ajv": "5.58.1",
            "@tsed/config": "5.58.1",
            "@tsed/core": "5.58.1",
            "@tsed/di": "5.58.1",
            "@tsed/exceptions": "5.58.1",
            "@tsed/json-mapper": "5.58.1",
            "@tsed/openspec": "5.58.1",
            "@tsed/platform-cache": "5.58.1",
            "@tsed/platform-exceptions": "5.58.1",
            "@tsed/platform-fastify": "5.58.1",
            "@tsed/platform-http": "5.58.1",
            "@tsed/platform-log-request": "5.58.1",
            "@tsed/platform-middlewares": "5.58.1",
            "@tsed/platform-multer": "5.58.1",
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
            "build": "yarn run barrels && swc src --out-dir dist -s  --strip-leading-paths",
            "start": "yarn run barrels && nodemon src/index.ts",
            "start:prod": "cross-env NODE_ENV=production node --import @swc-node/register/esm-register src/index.js",
          },
          "tsed": {
            "packageManager": "yarn",
            "platform": "fastify",
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

      await CliPlatformTest.initProject({
        platform: "express",
        rootDir: "./project-data",
        projectName: "project-data",
        tsedVersion: "5.58.1",
        commands: true
      });

      try {
        FakeCliFs.getKeys().map((key: string) => {
          const content = FakeCliFs.files.get(key)!;

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
          "project-name/src/Server.ts",
          "project-name/src/bin/commands/HelloCommand.ts",
          "project-name/src/bin/index.ts",
          "project-name/src/config/config.ts",
          "project-name/src/config/logger/index.ts",
          "project-name/src/config/utils/index.ts",
          "project-name/src/controllers/pages/IndexController.ts",
          "project-name/src/controllers/rest/HelloWorldController.ts",
          "project-name/src/index.ts",
          "project-name/tsconfig.base.json",
          "project-name/tsconfig.json",
          "project-name/tsconfig.node.json",
          "project-name/tsconfig.spec.json",
        ]
      `);
    });
  });
});
