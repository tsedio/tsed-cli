import {CliService, ProjectPackageJson} from "@tsed/cli-core";
import {CliPlatformTest, FakeCliFs} from "@tsed/cli-testing";
import {GenerateCmd, TEMPLATE_DIR} from "../../../src";

describe("Generate Response Filter", () => {
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
      type: "response-filter",
      name: "JSON"
    });

    expect(FakeCliFs.getKeys()).toEqual(["project-name/src/filters", "project-name/src/filters/JsonResponseFilter.ts"]);

    const result = FakeCliFs.entries.get("project-name/src/filters/JsonResponseFilter.ts");

    expect(result).toContain("import {ResponseFilter, ResponseFilterMethods} from \"@tsed/platform-response-filter\";");
    expect(result).toContain("import {BaseContext} from \"@tsed/di\";");
    expect(result).toContain("@ResponseFilter(\"text/xml\")");
    expect(result).toContain("export class XmlResponseFilter implements ResponseFilterMethods");
    expect(result).toContain("transform(data: any, ctx: BaseContext)");
  });
});
