import "../src/index.js";

import {ArchitectureConvention, FeatureType, InitCmd, PlatformType, ProjectConvention, TEMPLATE_DIR} from "@tsed/cli";
import {CliFs, PackageManager} from "@tsed/cli-core";
import {CliPlatformTest, FakeCliFs} from "@tsed/cli-testing";
import {FakeCliExeca} from "@tsed/cli-testing";
import {inject} from "@tsed/di";
import {$on} from "@tsed/hooks";

describe("Prisma: Init cmd", () => {
  beforeEach(() => {
    return CliPlatformTest.bootstrap({
      templateDir: TEMPLATE_DIR,
      commands: [InitCmd],
      argv: ["init"]
    });
  });
  afterEach(() => CliPlatformTest.reset());

  it("should generate a project with the right options", async () => {
    CliPlatformTest.setPackageJson({
      name: "",
      version: "1.0.0",
      description: "",
      scripts: {},
      dependencies: {},
      devDependencies: {}
    });

    $on("npx prisma init", () => {
      inject(CliFs).writeFileSync("project-name/prisma/schema.prisma", ``, {encoding: "utf8"});
    });

    await CliPlatformTest.exec("init", {
      verbose: false,
      root: ".",
      tsedVersion: "5.58.1",
      rootDir: "./.tmp/init/default",
      production: false,
      rawArgs: [],
      platform: PlatformType.EXPRESS,
      architecture: ArchitectureConvention.DEFAULT,
      convention: ProjectConvention.DEFAULT,
      packageManager: PackageManager.YARN,
      projectName: "default",
      db: true,
      typeorm: true,
      mysql: true,
      features: [FeatureType.ORM, FeatureType.PRISMA],
      srcDir: "src",
      pnpm: false,
      npm: false,
      yarn: true,
      express: true,
      koa: false,
      platformSymbol: "PlatformExpress",
      route: "/rest",
      prisma: true
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
        "project-name/prisma/schema.prisma",
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

    expect([...FakeCliExeca.entries.keys()]).toMatchInlineSnapshot(`
      [
        "yarn install",
        "yarn add --ignore-engines @tsed/logger @tsed/logger-std @tsed/engines @tsed/barrels ajv cross-env @swc/core @swc/cli @swc/helpers @swc-node/register typescript body-parser cors compression cookie-parser express method-override",
        "yarn add -D --ignore-engines @types/node @types/multer tslib nodemon @types/cors @types/express @types/compression @types/cookie-parser @types/method-override",
        "yarn add --ignore-engines @tsed/logger @tsed/logger-std @tsed/engines @tsed/barrels ajv cross-env @swc/core @swc/cli @swc/helpers @swc-node/register typescript body-parser cors compression cookie-parser express method-override @tsed/prisma @prisma/client",
        "yarn add -D --ignore-engines @types/node @types/multer tslib nodemon @types/cors @types/express @types/compression @types/cookie-parser @types/method-override prisma",
        "npx prisma init",
      ]
    `);

    const content = FakeCliFs.files.get("project-name/prisma/schema.prisma")!;

    expect(content).toMatchInlineSnapshot(`
      "
      generator tsed {
        provider = "tsed-prisma"
      }

      model User {
        id    Int     @default(autoincrement()) @id
        email String  @unique
        name  String?
      }
      "
    `);

    const pkgJson = FakeCliFs.files.get("project-name/package.json")!;

    expect(pkgJson).toMatchInlineSnapshot(`
      "{
        "name": "default",
        "version": "1.0.0",
        "description": "",
        "scripts": {
          "build": "yarn run barrels && swc src --out-dir dist -s  --strip-leading-paths",
          "barrels": "barrels",
          "start": "yarn run barrels && nodemon src/index.ts",
          "start:prod": "cross-env NODE_ENV=production node --import @swc-node/register/esm-register src/index.js",
          "prisma:migrate": "npx prisma migrate dev --name init",
          "prisma:generate": "npx prisma generate"
        },
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
          "@tsed/schema": "5.58.1"
        },
        "devDependencies": {
          "@tsed/cli-plugin-prisma": "1.0.0"
        },
        "tsed": {
          "runtime": "node",
          "packageManager": "yarn",
          "architecture": "arc_default",
          "convention": "conv_default",
          "platform": "express"
        },
        "type": "module"
      }"
    `);
  });
});
