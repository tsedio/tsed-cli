import {GenerateCmd} from "@tsed/cli";
import {CliService, ProjectPackageJson} from "@tsed/cli-core";
import {CliPlatformTest, FakeCliFs} from "@tsed/cli-testing";
import {resolve} from "path";
import "../../../src";

const TEMPLATE_DIR = resolve(require.resolve("@tsed/cli"), "..", "..", "templates");

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

    expect(FakeCliFs.getKeys()).toEqual([
      "project-name/src/controllers",
      "project-name/src/controllers/TestController.integration.spec.ts",
      "project-name/src/controllers/TestController.spec.ts",
      "project-name/src/controllers/TestController.ts"
    ]);

    const result = FakeCliFs.entries.get("project-name/src/controllers/TestController.integration.spec.ts");
    expect(result).toContain('import { PlatformTest } from "@tsed/common";');
    expect(result).toContain('import SuperTest from "supertest";');
    expect(result).toContain('import { Server } from "../Server";');
    expect(result).toContain('import { TestController } from "./TestController";');
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

    expect(FakeCliFs.getKeys()).toEqual([
      "project-name/src/controllers/users",
      "project-name/src/controllers/users/UserController.integration.spec.ts",
      "project-name/src/controllers/users/UserController.spec.ts",
      "project-name/src/controllers/users/UserController.ts"
    ]);

    const result = FakeCliFs.entries.get("project-name/src/controllers/users/UserController.integration.spec.ts");
    expect(result).toContain('import { PlatformTest } from "@tsed/common";');
    expect(result).toContain('import SuperTest from "supertest";');
    expect(result).toContain('import { Server } from "../../Server";');
    expect(result).toContain('import { UserController } from "./UserController";');
  });
});
