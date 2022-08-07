import {CliService, ProjectPackageJson} from "@tsed/cli-core";
import {CliPlatformTest, FakeCliFs} from "@tsed/cli-testing";
import {ensureDirSync, existsSync, readFileSync, writeFileSync} from "fs-extra";
import {InitCmd, TEMPLATE_DIR} from "@tsed/cli";
import {dirname} from "path";
import "@tsed/cli-plugin-oidc-provider";
import filedirname from "filedirname";

const [, dir] = filedirname();

function readFile(file: string, content: string, rewrite = false) {
  const path = `${dir}/${file}`

  ensureDirSync(dirname(path))

  if (!existsSync(path) || rewrite) {
    writeFileSync(path, content, {encoding: "utf8"});
  }

  return readFileSync(path, {encoding: "utf8"});
}

describe("Init OIDC Provider project", () => {
  beforeEach(() =>
    CliPlatformTest.bootstrap({
      templateDir: TEMPLATE_DIR,
      commands: [InitCmd]
    })
  );
  afterEach(() => CliPlatformTest.reset());

  it("should generate a project with oidc", async () => {
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

    await cliService.exec("init", {
      platform: "express",
      rootDir: "./project-data",
      projectName: "project-data",
      tsedVersion: "5.58.1",
      oidc: true,
      jest: true,
      oidcBasePath: "/oidc"
    });

    expect(FakeCliFs.getKeys()).toMatchSnapshot();

    const content = FakeCliFs.entries.get("project-name/src/Server.ts")!;

    expect(content).toContain("import \"@tsed/oidc-provider\"");
    expect(content).toContain("import {InteractionsController} from \"./controllers/oidc/InteractionsController\";");
    expect(content).toMatchSnapshot();

    const configContent = FakeCliFs.entries.get("project-name/src/config/oidc/index.ts")!;

    expect(configContent).toContain("path: \"/oidc\"");
  });
  it("should generate a project with oidc and swagger", async () => {
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

    await cliService.exec("init", {
      platform: "express",
      rootDir: "./project-data",
      projectName: "project-data",
      tsedVersion: "5.58.1",
      oidc: true,
      swagger: true,
      oidcBasePath: "/oidc"
    });

    expect(FakeCliFs.getKeys()).toMatchSnapshot();

    const content = FakeCliFs.entries.get("project-name/src/Server.ts")!;

    expect(content).toContain("import \"@tsed/oidc-provider\"");
    expect(content).toContain("import {InteractionsController} from \"./controllers/oidc/InteractionsController\";");
    expect(content).toMatchSnapshot();

    const configContent = FakeCliFs.entries.get("project-name/src/config/oidc/index.ts")!;

    expect(configContent).toContain("path: \"/oidc\"");
  });
});
