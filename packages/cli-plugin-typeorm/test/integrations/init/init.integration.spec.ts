import {CliService, PackageManager, ProjectPackageJson} from "@tsed/cli-core";
import {CliPlatformTest, FakeCliFs} from "@tsed/cli-testing";
import {ensureDirSync, existsSync, readFileSync, writeFileSync} from "fs-extra";
import {dirname} from "path";
import {ArchitectureConvention, FeatureType, InitCmd, PlatformType, ProjectConvention, TEMPLATE_DIR} from "@tsed/cli";
import "../../../src";
import filedirname from "filedirname";

const [, dir] = filedirname();

function readFile(file: string, content: string, rewrite = true) {
  const path = `${dir}/${file}`

  ensureDirSync(dirname(path))

  if (!existsSync(path) || rewrite) {
    writeFileSync(path, content, {encoding: "utf8"});
  }

  return readFileSync(path, {encoding: "utf8"});
}

describe("TypeORM: Init cmd", () => {
  beforeEach(() => {
      return CliPlatformTest.bootstrap({
        templateDir: TEMPLATE_DIR,
        commands: [InitCmd]
      });
    }
  );
  afterEach(() => CliPlatformTest.reset());

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
        features: [
          FeatureType.DB,
          FeatureType.TYPEORM,
          FeatureType.TYPEORM_MYSQL,
        ],
        srcDir: "src",
        pnpm: false,
        npm: false,
        yarn: true,
        express: true,
        koa: false,
        platformSymbol: "PlatformExpress"
      }
    );

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
      "project-name/src/datasources",
      "project-name/src/datasources/MysqlDatasource.ts",
      "project-name/src/index.ts",
      "project-name/tsconfig.compile.json",
      "project-name/tsconfig.json"
    ]);

    const content = FakeCliFs.entries.get("project-name/src/Server.ts")!;
    expect(content).toMatchSnapshot();

    const datasource = FakeCliFs.entries.get("project-name/src/datasources/MysqlDatasource.ts")!;
    expect(datasource).toEqual(readFile("data/MysqlDatasource.ts.txt", datasource, false));
  });
  it("should not generate database if any option is selected", async () => {
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
        verbose: false,
        root: ".",
        tsedVersion: "5.58.1",
        rootDir: "./.tmp/init/default",
        production: false,
        rawArgs: [],
        platform: "express",
        architecture: "default",
        convention: "default",
        packageManager: "yarn",
        projectName: "default",
        db: true,
        typeorm: true,
        mysql: true,
        features: [
        ],
        srcDir: "src",
        pnpm: false,
        npm: false,
        yarn: true,
        express: true,
        koa: false,
        platformSymbol: "PlatformExpress"
      }
    );

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
  });
});
