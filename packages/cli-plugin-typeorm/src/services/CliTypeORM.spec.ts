import {CliPlatformTest} from "@tsed/cli-testing";
import {CliTypeORM} from "./CliTypeORM";
import {ProjectPackageJson, SrcRendererService} from "@tsed/cli-core";

async function createServiceFixture() {
  const srcRenderer = {
    write: jest.fn()
  };
  const initCommand = {
    getOrmConfigTemplate: jest.fn().mockReturnValue(
      JSON.stringify({
        name: "default",
        type: "postgres",
        host: "localhost",
        port: 5432,
        username: "test",
        password: "test",
        database: "test",
        synchronize: true,
        logging: false,
        entities: ["src/entities/**/*.ts"],
        migrations: ["src/migration/**/*.ts"],
        subscribers: ["src/subscriber/**/*.ts"],
        cli: {
          entitiesDir: "src/entity",
          migrationsDir: "src/migration",
          subscribersDir: "src/subscriber"
        }
      })
    )
  };
  const packageJsonService = {
    importModule: jest.fn().mockReturnValue({
      InitCommand: initCommand
    })
  };

  const service = await CliPlatformTest.invoke<CliTypeORM>(CliTypeORM, [
    {
      token: ProjectPackageJson,
      use: packageJsonService
    },
    {
      token: SrcRendererService,
      use: srcRenderer
    }
  ]);

  return {service, srcRenderer, initCommand, packageJsonService};
}

describe("CliTypeORM", () => {
  beforeEach(() =>
    CliPlatformTest.create({
      name: "tsed"
    })
  );
  afterEach(CliPlatformTest.reset);
  describe("writeConfig()", () => {
    it("should write configuration", async () => {
      const {service, srcRenderer} = await createServiceFixture();

      jest.spyOn(service, "regenerateIndexConfig").mockReturnValue(Promise.resolve());

      await service.writeConfig("name", "postgres");

      expect(srcRenderer.write).toHaveBeenCalledWith(
        JSON.stringify(
          {
            name: "default",
            type: "postgres",
            host: "localhost",
            port: 5432,
            username: "test",
            password: "test",
            database: "test",
            synchronize: true,
            logging: false,
            entities: ["${rootDir}/entities/**/*.{js,ts}"],
            migrations: ["${rootDir}/migration/**/*.{js,ts}"],
            subscribers: ["${rootDir}/subscriber/**/*.{js,ts}"],
            cli: {
              entitiesDir: "${rootDir}/entity",
              migrationsDir: "${rootDir}/migration",
              subscribersDir: "${rootDir}/subscriber"
            }
          },
          null,
          2
        ),
        {output: "config/typeorm/name.config.json"}
      );
    });
  });
});
