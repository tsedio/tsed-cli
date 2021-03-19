import {CliService, ProjectPackageJson} from "@tsed/cli-core";
import {CliPlatformTest, FakeCliFs} from "@tsed/cli-testing";
import {readFileSync} from "fs";
import {resolve} from "path";
import {GenerateCmd} from "../../../src";

const TEMPLATE_DIR = resolve(__dirname, "..", "..", "..", "templates");

describe("Generate middleware decorator", () => {
  beforeEach(() =>
    CliPlatformTest.bootstrap({
      templateDir: TEMPLATE_DIR,
      commands: [GenerateCmd]
    })
  );
  afterEach(() => CliPlatformTest.reset());

  it("should generate a template with the right options (before)", async () => {
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
      templateType: "middleware",
      name: "Test",
      middlewarePosition: "before"
    });

    expect(FakeCliFs.getKeys()).toEqual(["project-name/src/decorators", "project-name/src/decorators/Test.ts"]);

    const result = FakeCliFs.entries.get("project-name/src/decorators/Test.ts");

    expect(result).toContain('import {useDecorators, StoreSet} from "@tsed/core"');
    expect(result).toContain("export interface TestOptions {");
    expect(result).toContain("@Middleware()");
    expect(result).toContain("export function Test(options: TestOptions): MethodDecorator");
    expect(result).toContain("const {}: TestOptions = context.endpoint.get(TestMiddleware)");
    expect(result).toContain("StoreSet(TestMiddleware, options)");
    expect(result).toContain("UseBefore(TestMiddleware)");
  });
  it("should generate a template with the right options (after)", async () => {
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
      templateType: "middleware",
      name: "Test",
      middlewarePosition: "after"
    });

    expect(FakeCliFs.getKeys()).toEqual(["project-name/src/decorators", "project-name/src/decorators/Test.ts"]);

    const result = FakeCliFs.entries.get("project-name/src/decorators/Test.ts");

    expect(result).toContain('import {useDecorators, StoreSet} from "@tsed/core"');
    expect(result).toContain("export interface TestOptions {");
    expect(result).toContain("@Middleware()");
    expect(result).toContain("export function Test(options: TestOptions): MethodDecorator");
    expect(result).toContain("const {}: TestOptions = context.endpoint.get(TestMiddleware)");
    expect(result).toContain("const data = context.data;");
    expect(result).toContain("StoreSet(TestMiddleware, options)");
    expect(result).toContain("UseAfter(TestMiddleware)");
  });
});
