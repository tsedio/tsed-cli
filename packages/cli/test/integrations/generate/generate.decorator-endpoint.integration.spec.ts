import {CliService, ProjectPackageJson} from "@tsed/cli-core";
import {CliPlatformTest, FakeCliFs} from "@tsed/cli-testing";
import {resolve} from "path";

import {GenerateCmd, TEMPLATE_DIR} from "../../../src/index.js";

describe("Generate endpoint decorator", () => {
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
      type: "decorator",
      templateType: "endpoint",
      name: "Test"
    });

    expect(FakeCliFs.getKeys()).toEqual(["project-name/src/decorators", "project-name/src/decorators/Test.ts"]);

    const result = FakeCliFs.entries.get("project-name/src/decorators/Test.ts");

    expect(result).toContain('import {useDecorators} from "@tsed/core"');
    expect(result).toContain('import {JsonEntityFn, JsonEntityStore} from "@tsed/schema"');
    expect(result).toContain("export interface TestOptions {");
    expect(result).toContain("export function Test(options: TestOptions): MethodDecorator");
    expect(result).toContain("JsonEntityFn((entity: JsonEntityStore)");
    expect(result).toContain("entity.store.set(Test, options)");
  });
});
