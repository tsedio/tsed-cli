import {CliService, ProjectPackageJson} from "@tsed/cli-core";
import {CliPlatformTest, FakeCliFs} from "@tsed/cli-testing";
import {resolve} from "path";
import {GenerateCmd} from "../../../src";

const TEMPLATE_DIR = resolve(__dirname, "..", "..", "..", "templates");

describe("Generate endpoint decorator", () => {
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
      type: "decorator",
      templateType: "endpoint",
      name: "Test"
    });

    expect(FakeCliFs.getKeys()).toEqual(["project-name/src/decorators", "project-name/src/decorators/Test.ts"]);

    const result = FakeCliFs.entries.get("project-name/src/decorators/Test.ts");

    expect(result).toContain('import {useDecorators} from "@tsed/core"');
    expect(result).toContain('import {EndpointFn, EndpointMetadata} from "@tsed/common"');
    expect(result).toContain("export interface TestOptions {");
    expect(result).toContain("export function Test(options: TestOptions): MethodDecorator");
    expect(result).toContain("EndpointFn((endpoint: EndpointMetadata)");
    expect(result).toContain("endpoint.store.set(Test, options)");
  });
});
