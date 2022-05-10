import {CliService, ProjectPackageJson} from "@tsed/cli-core";
import {CliPlatformTest, FakeCliFs} from "@tsed/cli-testing";
import {ensureDirSync, existsSync, readFileSync, writeFileSync} from "fs-extra";
import {InitCmd, TEMPLATE_DIR} from "@tsed/cli";
import {dirname} from "path";
import "@tsed/cli-plugin-typegraphql";

function readFile(file: string, content: string, rewrite = false) {
  const path = `${__dirname}/${file}`

  ensureDirSync(dirname(path))

  if (!existsSync(path) || rewrite) {
    writeFileSync(path, content, {encoding: "utf8"});
  }

  return readFileSync(path, {encoding: "utf8"});
}

describe("Init TypeGraphQL project", () => {
  beforeEach(() =>
    CliPlatformTest.bootstrap({
      templateDir: TEMPLATE_DIR,
      commands: [InitCmd]
    })
  );
  afterEach(() => CliPlatformTest.reset());

  it("should generate a project with typegraphql", async () => {
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

    await cliService.exec("init", {
      platform: "express",
      rootDir: "./project-data",
      projectName: "project-data",
      tsedVersion: "5.58.1",
      graphql: true
    });

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
      "project-name/src/datasources/MyDataSource",
      "project-name/src/datasources/index.ts",
      "project-name/src/index.ts",
      "project-name/src/resolvers",
      "project-name/src/resolvers/index.ts",
      "project-name/src/resolvers/recipes",
      "project-name/src/resolvers/recipes/Recipe.ts",
      "project-name/src/resolvers/recipes/RecipeNotFoundError.ts",
      "project-name/src/resolvers/recipes/RecipeResolver.ts",
      "project-name/tsconfig.compile.json",
      "project-name/tsconfig.json"
    ]);

    const content = FakeCliFs.entries.get("project-name/src/Server.ts")!;

    expect(content).toContain("import \"@tsed/typegraphql\"");
    expect(content).toContain("import \"./datasources\";");
    expect(content).toContain("import \"./resolvers\";");
    expect(content).toEqual(readFile("data/Server.typegraphql.ts.txt", content));

    const configContent = FakeCliFs.entries.get("project-name/src/config/index.ts")!;

    expect(configContent).toEqual(readFile("data/config.typegraphql.ts.txt", configContent));
  });
});
