import {CliService, ProjectPackageJson} from "@tsed/cli-core";
import {CliPlatformTest, FakeCliFs} from "@tsed/cli-testing";
import {readFileSync} from "fs";
import {resolve} from "path";
import {GenerateCmd} from "../../../src";

const TEMPLATE_DIR = resolve(__dirname, "..", "..", "..", "templates");

describe("Generate Controller", () => {
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
      type: "controller",
      name: "Test",
      route: "/tests"
    });

    expect(FakeCliFs.getKeys()).toEqual(["project-name/src/controllers", "project-name/src/controllers/TestController.ts"]);

    const result = FakeCliFs.entries.get("project-name/src/controllers/TestController.ts");
    expect(result).toContain('import {Controller, Get} from "@tsed/common";');
    expect(result).toContain('@Controller("/tests")');
    expect(result).toContain("TestController");
  });
  it("should generate the template with the right options (complex path)", async () => {
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
      type: "controller",
      name: "users/User",
      route: "/users"
    });

    expect(FakeCliFs.getKeys()).toEqual(["project-name/src/controllers/users", "project-name/src/controllers/users/UserController.ts"]);

    const result = FakeCliFs.entries.get("project-name/src/controllers/users/UserController.ts");
    expect(result).toContain('import {Controller, Get} from "@tsed/common";');
    expect(result).toContain('@Controller("/users")');
    expect(result).toContain("UserController");
  });
});
