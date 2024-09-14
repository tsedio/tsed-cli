import {CliPlatformTest, FakeCliFs} from "@tsed/cli-testing";

import {GenerateCmd, TEMPLATE_DIR} from "../../../src";

describe("Generate AsyncFactory", () => {
  beforeEach(() =>
    CliPlatformTest.bootstrap({
      templateDir: TEMPLATE_DIR,
      commands: [GenerateCmd]
    })
  );
  afterEach(() => CliPlatformTest.reset());

  it("should generate a template with the right options", async () => {
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
      type: "async.factory",
      name: "Test"
    });

    expect(FakeCliFs.getKeys()).toEqual(["project-name/src/services", "project-name/src/services/Test.ts"]);

    const result = FakeCliFs.entries.get("project-name/src/services/Test.ts");

    expect(result).toContain('import {Configuration, Inject, registerProvider} from "@tsed/di";');
    expect(result).toContain("export function Test()");
    expect(result).toContain("Inject(Test)");
    expect(result).toContain("registerProvider");
    expect(result).toContain("provide: Test");
  });
});
