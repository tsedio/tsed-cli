import {CliService, ProjectPackageJson} from "@tsed/cli-core";
import {CliPlatformTest, FakeCliFs} from "@tsed/cli-testing";
import {readFileSync} from "fs";
import {resolve} from "path";
import {GenerateCmd} from "../../../src";

const TEMPLATE_DIR = resolve(__dirname, "..", "..", "..", "templates");

function readFile(file: string) {
  return readFileSync(`${__dirname}/${file}`, {encoding: "utf8"});
}

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
      type: "exception-filter",
      name: "Http"
    });

    expect(FakeCliFs.getKeys()).toEqual(["project-name/src/filters", "project-name/src/filters/HttpExceptionFilter.ts"]);

    const result = FakeCliFs.entries.get("project-name/src/filters/HttpExceptionFilter.ts");

    expect(result).toContain('import {Catch, PlatformContext, ExceptionFilterMethods} from "@tsed/common";');
    expect(result).toContain("@Catch(Error)");
    expect(result).toContain("export class HttpExceptionFilter implements ExceptionFilterMethods");
    expect(result).toContain("catch(exception: Exception, ctx: PlatformContext) {");
  });
});
