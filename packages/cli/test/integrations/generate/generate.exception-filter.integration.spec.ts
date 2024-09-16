import {CliService, ProjectPackageJson} from "@tsed/cli-core";
import {CliPlatformTest, FakeCliFs} from "@tsed/cli-testing";

import {GenerateCmd, TEMPLATE_DIR} from "../../../src/index.js";

describe("Generate Exception Filter", () => {
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
      type: "exception-filter",
      name: "Http"
    });

    expect(FakeCliFs.getKeys()).toEqual(["project-name/src/filters", "project-name/src/filters/HttpExceptionFilter.ts"]);

    const result = FakeCliFs.entries.get("project-name/src/filters/HttpExceptionFilter.ts");

    expect(result).toContain('import {BaseContext} from "@tsed/di";');
    expect(result).toContain('import {Catch, ExceptionFilterMethods} from "@tsed/platform-exceptions";');
    expect(result).toContain("@Catch(Error)");
    expect(result).toContain("export class HttpExceptionFilter implements ExceptionFilterMethods");
    expect(result).toContain("catch(exception: Exception, ctx: BaseContext) {");
  });
});
