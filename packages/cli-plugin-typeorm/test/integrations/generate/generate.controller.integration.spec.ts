import {GenerateCmd} from "@tsed/cli";
import {CliService, ProjectPackageJson} from "@tsed/cli-core";
import {CliPlatformTest, FakeCliFs} from "@tsed/cli-testing";
import {dirname, resolve} from "path";
import "../../../src";
import {ensureDirSync, existsSync, readFileSync, writeFileSync} from "fs-extra";

const TEMPLATE_DIR = resolve(require.resolve("@tsed/cli"), "..", "..", "templates");

function readFile(file: string, content: string, rewrite = true) {
  const path = `${__dirname}/${file}`

  ensureDirSync(dirname(path))

  if (!existsSync(path) || rewrite) {
    writeFileSync(path, content, {encoding: "utf8"});
  }

  return readFileSync(path, {encoding: "utf8"});
}

describe("Generate DataSource", () => {
  beforeEach(() =>
    CliPlatformTest.bootstrap({
      templateDir: TEMPLATE_DIR,
      commands: [GenerateCmd]
    })
  );
  afterEach(() => CliPlatformTest.reset());

  it("should generate the template with the right options (simple path)", async () => {
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

    await cliService.exec("generate", {
      rootDir: "./project-data",
      type: "typeorm:datasource",
      name: "Test",
      typeormDataSource: "typeorm:mysql"
    });

    expect(FakeCliFs.getKeys()).toEqual([
      "project-name/docker-compose.yml",
      "project-name/src/datasources",
      "project-name/src/datasources/TestDatasource.ts"
    ]);

    const datasource = FakeCliFs.entries.get("project-name/src/datasources/TestDatasource.ts");

    expect(datasource).toEqual(readFile("data/TestDatasource.ts.txt", datasource!));

    const dockerCompose = FakeCliFs.entries.get("project-name/docker-compose.yml");
    expect(dockerCompose).toEqual(readFile("data/docker-compose.yml.txt", dockerCompose!, false));
  });
});
