import {CliPlatformTest, FakeCliFs} from "@tsed/cli-testing";
import {InitCmd, TEMPLATE_DIR} from "@tsed/cli";
import "@tsed/cli-plugin-oidc-provider";

describe("Init OIDC Provider project", () => {
  beforeEach(() =>
    CliPlatformTest.bootstrap({
      templateDir: TEMPLATE_DIR,
      commands: [InitCmd],
      args: ["init"]
    })
  );
  afterEach(() => CliPlatformTest.reset());

  it("should generate a project with oidc", async () => {
    CliPlatformTest.setPackageJson({
      name: "",
      version: "1.0.0",
      description: "",
      scripts: {},
      dependencies: {},
      devDependencies: {}
    });

    await CliPlatformTest.exec("init", {
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
    CliPlatformTest.setPackageJson({
      name: "",
      version: "1.0.0",
      description: "",
      scripts: {},
      dependencies: {},
      devDependencies: {}
    });

    await CliPlatformTest.exec("init", {
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
