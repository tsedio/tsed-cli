import "../../../src/index.js";

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
    await CliPlatformTest.initProject();

    await CliPlatformTest.exec("generate", {
      rootDir: "./project-data",
      type: "typeorm:datasource",
      name: "Test",
      typeormDataSource: "typeorm:mysql"
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
        "project-name/processes.config.cjs",
        "project-name/src/Server.ts",
        "project-name/src/config/config.ts",
        "project-name/src/config/logger/index.ts",
        "project-name/src/config/utils/index.ts",
        "project-name/src/controllers/pages/IndexController.ts",
        "project-name/src/controllers/rest/HelloWorldController.ts",
        "project-name/src/datasources/TestDatasource.ts",
        "project-name/src/index.ts",
        "project-name/tsconfig.base.json",
        "project-name/tsconfig.json",
        "project-name/tsconfig.node.json",
        "project-name/tsconfig.spec.json",
        "project-name/views",
        "project-name/views/home.ejs",
      ]
    `);

    const datasource = FakeCliFs.files.get("project-name/src/datasources/TestDatasource.ts");

    expect(datasource).toMatchInlineSnapshot(`
      "import { injectable, logger } from "@tsed/di";
      import { DataSource } from "typeorm";

      export const testDatasource = new DataSource({
        type: "mysql",
        entities: [],
        host: "localhost",
        port: 3306,
        username: "test",
        password: "test",
        database: "test"
      });

      export const TestDatasource = injectable(Symbol.for("TestDatasource"))
        .type("typeorm:datasource")
        .asyncFactory(async () => {
          await testDatasource.initialize();

          logger().info("Connected with typeorm to database: Test");

          return testDatasource;
        })
        .hooks({
          $onDestroy(dataSource) {
            return dataSource.isInitialized && dataSource.close();
          }
        })
        .token();

      export type TestDatasource = DataSource;
      "
    `);

    const dockerCompose = FakeCliFs.files.get("project-name/docker-compose.yml");
    expect(dockerCompose).toMatchInlineSnapshot(`
      "services:
        test:
          image: mysql:8.0.28-oracle
          ports:
            - '3306:3306'
          environment:
            MYSQL_ROOT_PASSWORD: admin
            MYSQL_USER: test
            MYSQL_PASSWORD: test
            MYSQL_DATABASE: test
      "
    `);
  });
});
