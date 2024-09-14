import "../../../src";

import {ArchitectureConvention, FeatureType, InitCmd, PlatformType, ProjectConvention, TEMPLATE_DIR} from "@tsed/cli";
import {PackageManager} from "@tsed/cli-core";
import {CliPlatformTest, FakeCliFs} from "@tsed/cli-testing";

describe("TypeORM: Init cmd", () => {
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
      features: [FeatureType.DB, FeatureType.TYPEORM, FeatureType.TYPEORM_MYSQL],
      srcDir: "src",
      pnpm: false,
      npm: false,
      yarn: true,
      express: true,
      koa: false,
      platformSymbol: "PlatformExpress"
    });

    expect(FakeCliFs.getKeys()).toMatchInlineSnapshot(`
      [
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
        "project-name/src/datasources",
        "project-name/src/datasources/MysqlDatasource.ts",
        "project-name/src/index.ts",
        "project-name/tsconfig.compile.json",
        "project-name/tsconfig.json",
      ]
    `);

    const content = FakeCliFs.entries.get("project-name/src/Server.ts")!;
    expect(content).toMatchSnapshot();

    const datasource = FakeCliFs.entries.get("project-name/src/datasources/MysqlDatasource.ts")!;
    expect(datasource).toMatchSnapshot();

    const spec = FakeCliFs.entries.get("project-name/src/datasources/MysqlDatasource.spec.ts")!;
    expect(spec).toMatchSnapshot();
  });
  it("should not generate database if any option is selected", async () => {
    CliPlatformTest.setPackageJson({
      name: "",
      version: "1.0.0",
      description: "",
      scripts: {},
      dependencies: {},
      devDependencies: {}
    });

    await CliPlatformTest.exec("init", {
      verbose: false,
      root: ".",
      tsedVersion: "5.58.1",
      rootDir: "./.tmp/init/default",
      production: false,
      rawArgs: [],
      platform: "express",
      architecture: "arc_default",
      convention: "conv_default",
      packageManager: "yarn",
      projectName: "default",
      db: true,
      typeorm: true,
      mysql: true,
      features: [],
      srcDir: "src",
      pnpm: false,
      npm: false,
      yarn: true,
      express: true,
      koa: false,
      platformSymbol: "PlatformExpress"
    });

    expect(FakeCliFs.getKeys()).toMatchInlineSnapshot(`
      [
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
        "project-name/tsconfig.json",
      ]
    `);
  });
});
