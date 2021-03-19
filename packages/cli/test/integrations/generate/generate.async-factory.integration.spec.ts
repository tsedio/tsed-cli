import {CliService, ProjectPackageJson} from "@tsed/cli-core";
import {CliPlatformTest, FakeCliFs} from "@tsed/cli-testing";
import {readFileSync} from "fs";
import {resolve} from "path";
import {GenerateCmd} from "../../../src";

const TEMPLATE_DIR = resolve(__dirname, "..", "..", "..", "templates");

function readFile(file: string) {
  return readFileSync(`${__dirname}/${file}`, {encoding: "utf8"});
}

describe("Generate AsyncFactory", () => {
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
