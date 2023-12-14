import {CliPlatformTest, FakeCliFs} from "@tsed/cli-testing";
import {InitCmd, TEMPLATE_DIR} from "@tsed/cli";
import "@tsed/cli-plugin-typegraphql";

describe("Init TypeGraphQL project", () => {
  beforeEach(() =>
    CliPlatformTest.bootstrap({
      templateDir: TEMPLATE_DIR,
      commands: [InitCmd]
    })
  );
  afterEach(() => CliPlatformTest.reset());

  it("should generate a project with typegraphql", async () => {
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
      convention: "conv_default",
      rootDir: "./project-data",
      projectName: "project-data",
      tsedVersion: "5.58.1",
      graphql: true
    });

    expect(FakeCliFs.getKeys()).toMatchInlineSnapshot(`
      Array [
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
        "project-name/src/datasources/MyDataSource.ts",
        "project-name/src/datasources/index.ts",
        "project-name/src/index.ts",
        "project-name/src/resolvers",
        "project-name/src/resolvers/index.ts",
        "project-name/src/resolvers/recipes",
        "project-name/src/resolvers/recipes/Recipe.ts",
        "project-name/src/resolvers/recipes/RecipeNotFoundError.ts",
        "project-name/src/resolvers/recipes/RecipeResolver.ts",
        "project-name/src/services",
        "project-name/src/services/RecipeService.ts",
        "project-name/tsconfig.compile.json",
        "project-name/tsconfig.json",
      ]
    `);

    const content = FakeCliFs.entries.get("project-name/src/Server.ts")!;
    expect(content).toMatchSnapshot();
    expect(content).toContain("import \"@tsed/typegraphql\"");
    expect(content).toContain("import \"./datasources/index\";");
    expect(content).toContain("import \"./resolvers/index\";");

    const configContent = FakeCliFs.entries.get("project-name/src/config/index.ts")!;
    expect(configContent).toMatchSnapshot();
  });
});
