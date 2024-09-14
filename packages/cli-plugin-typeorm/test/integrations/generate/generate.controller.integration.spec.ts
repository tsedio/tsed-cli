import "../../../src";

import {GenerateCmd, TEMPLATE_DIR} from "@tsed/cli";
import {CliPlatformTest, FakeCliFs} from "@tsed/cli-testing";

describe("Generate DataSource", () => {
  beforeEach(() =>
    CliPlatformTest.bootstrap({
      templateDir: TEMPLATE_DIR,
      commands: [GenerateCmd]
    })
  );
  afterEach(() => CliPlatformTest.reset());

  it("should generate the template with the right options (simple path)", async () => {
    CliPlatformTest.setPackageJson({
      name: "",
      version: "1.0.0",
      description: "",
      scripts: {},
      dependencies: {},
      devDependencies: {}
    });

    await CliPlatformTest.exec("generate", {
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

    expect(datasource).toMatchSnapshot();

    const dockerCompose = FakeCliFs.entries.get("project-name/docker-compose.yml");
    expect(dockerCompose).toMatchSnapshot();
  });
});
