import {CliService, ProjectPackageJson} from "@tsed/cli-core";
import {CliPlatformTest, FakeCliFs} from "@tsed/cli-testing";
import {readFileSync} from "fs";
import {resolve} from "path";
import {GenerateCmd} from "../../../src";

const TEMPLATE_DIR = resolve(__dirname, "..", "..", "..", "templates");

function readFile(file: string) {
  return readFileSync(`${__dirname}/${file}`, {encoding: "utf8"});
}

describe("Generate Response Filter", () => {
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
      type: "response-filter",
      name: "JSON"
    });

    expect(FakeCliFs.getKeys()).toEqual(["project-name/src/filters", "project-name/src/filters/JsonResponseFilter.ts"]);

    const result = FakeCliFs.entries.get("project-name/src/filters/JsonResponseFilter.ts");

    expect(result).toContain('import {ResponseFilter, Context, ResponseFilterMethods} from "@tsed/common";');
    expect(result).toContain("@ResponseFilter(\"text/xml\")");
    expect(result).toContain("export class XmlResponseFilter implements ResponseFilterMethods");
    expect(result).toContain("transform(data: any, ctx: Context)");
  });
});
