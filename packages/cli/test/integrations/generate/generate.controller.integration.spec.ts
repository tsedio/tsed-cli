import {CliService, ProjectPackageJson} from "@tsed/cli-core";
import {CliPlatformTest, FakeCliFs} from "@tsed/cli-testing";

import {GenerateCmd, TEMPLATE_DIR} from "../../../src";

describe("Generate Controller", () => {
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
      type: "controller",
      name: "Test",
      route: "/tests"
    });

    expect(FakeCliFs.getKeys()).toEqual(["project-name/src/controllers", "project-name/src/controllers/TestController.ts"]);

    const result = FakeCliFs.entries.get("project-name/src/controllers/TestController.ts");
    expect(result).toContain('import {Controller} from "@tsed/di";');
    expect(result).toContain('import {Get} from "@tsed/schema";');
    expect(result).toContain('@Controller("/tests")');
    expect(result).toContain("TestController");
  });
  it("should generate the template with the right options (complex path)", async () => {
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
      type: "controller",
      name: "users/User",
      route: "/users"
    });

    expect(FakeCliFs.getKeys()).toEqual(["project-name/src/controllers/users", "project-name/src/controllers/users/UserController.ts"]);

    const result = FakeCliFs.entries.get("project-name/src/controllers/users/UserController.ts");
    expect(result).toContain('import {Controller} from "@tsed/di";');
    expect(result).toContain('import {Get} from "@tsed/schema";');
    expect(result).toContain('@Controller("/users")');
    expect(result).toContain("UserController");
  });
});
