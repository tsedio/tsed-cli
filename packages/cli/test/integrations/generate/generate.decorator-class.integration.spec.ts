import {CliService, ProjectPackageJson} from "@tsed/cli-core";
import {CliPlatformTest, FakeCliFs} from "@tsed/cli-testing";

import {GenerateCmd, TEMPLATE_DIR} from "../../../src/index.js";

describe("Generate class decorator", () => {
  beforeEach(() =>
    CliPlatformTest.bootstrap({
      templateDir: TEMPLATE_DIR,
      commands: [GenerateCmd]
    })
  );
  afterEach(() => CliPlatformTest.reset());

  it("should generate a template with the right options", async () => {
    const cliService = CliPlatformTest.get<CliService>(CliService);
    const projectPackageJson = CliPlatformTest.get<ProjectPackageJson>(ProjectPackageJson);
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
      type: "decorator",
      templateType: "class",
      name: "Test"
    });

    expect(FakeCliFs.getKeys()).toEqual(["project-name/src/decorators", "project-name/src/decorators/Test.ts"]);

    const result = FakeCliFs.entries.get("project-name/src/decorators/Test.ts");

    expect(result).toContain("export interface TestOptions {");
    expect(result).toContain("export function Test(options: TestOptions): ClassDecorator");
    expect(result).toContain("(target: any): any =>");
    expect(result).toContain("return class extends target");
    expect(result).toContain("constructor(...args: any[])");
    expect(result).toContain("super(...args)");
  });
});
