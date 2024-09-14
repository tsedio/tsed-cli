import {CliService, ProjectPackageJson} from "@tsed/cli-core";
import {CliPlatformTest, FakeCliFs} from "@tsed/cli-testing";

import {GenerateCmd, TEMPLATE_DIR} from "../../../src";

describe("Generate generic decorator", () => {
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
      templateType: "generic",
      name: "Test"
    });

    expect(FakeCliFs.getKeys()).toEqual(["project-name/src/decorators", "project-name/src/decorators/Test.ts"]);

    const result = FakeCliFs.entries.get("project-name/src/decorators/Test.ts");

    expect(result).toContain('import {DecoratorTypes, UnsupportedDecoratorType, decoratorTypeOf} from "@tsed/core"');
    expect(result).toContain("export interface TestOptions {");
    expect(result).toContain("export function Test(options: TestOptions): any");
    expect(result).toContain("(...args: DecoratorParameters): any =>");
    expect(result).toContain("switch(decoratorTypeOf(args))");
    expect(result).toContain("DecoratorTypes.CLASS");
    expect(result).toContain("throw new UnsupportedDecoratorType(Test, args)");
  });
});
