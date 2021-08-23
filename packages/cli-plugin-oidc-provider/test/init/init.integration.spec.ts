import {CliService, ProjectPackageJson} from "@tsed/cli-core";
import {CliPlatformTest, FakeCliFs} from "@tsed/cli-testing";
import {ensureDirSync, existsSync, readFileSync, writeFileSync} from "fs-extra";
import {InitCmd, TEMPLATE_DIR} from "@tsed/cli";
import {dirname} from "path";
import "@tsed/cli-plugin-oidc-provider";

function readFile(file: string, content: string, rewrite = false) {
  const path = `${__dirname}/${file}`

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
      oidcBasePath: "/oidc"
    });

    expect(FakeCliFs.getKeys()).toEqual([
      "./project-name",
      "project-name",
      "project-name/.dockerignore",
      "project-name/.gitignore",
      "project-name/Dockerfile",
      "project-name/README.md",
      "project-name/docker-compose.yml",
      "project-name/package.json",
      "project-name/src",
      "project-name/src/Server.ts",
      "project-name/src/config",
      "project-name/src/config/env",
      "project-name/src/config/env/index.ts",
      "project-name/src/config/index.ts",
      "project-name/src/config/logger",
      "project-name/src/config/logger/index.ts",
      "project-name/src/config/oidc",
      "project-name/src/config/oidc/index.ts",
      "project-name/src/controllers",
      "project-name/src/controllers/HelloWorldController.ts",
      "project-name/src/controllers/oidc",
      "project-name/src/controllers/oidc/InteractionsCtrl.ts",
      "project-name/src/index.ts",
      "project-name/src/interactions",
      "project-name/src/interactions/ConsentInteraction.ts",
      "project-name/src/interactions/CustomInteraction.ts",
      "project-name/src/interactions/LoginInteraction.ts",
      "project-name/src/models",
      "project-name/src/models/Account.ts",
      "project-name/src/services",
      "project-name/src/services/Accounts.ts",
      "project-name/tsconfig.compile.json",
      "project-name/tsconfig.json",
      "project-name/views",
      "project-name/views/forms",
      "project-name/views/forms/interaction-form.ejs",
      "project-name/views/forms/login-form.ejs",
      "project-name/views/forms/select-account-form.ejs",
      "project-name/views/interaction.ejs",
      "project-name/views/login.ejs",
      "project-name/views/partials",
      "project-name/views/partials/footer.ejs",
      "project-name/views/partials/header.ejs",
      "project-name/views/partials/login-help.ejs",
      "project-name/views/repost.ejs",
      "project-name/views/select_account.ejs"
    ]);

    const content = FakeCliFs.entries.get("project-name/src/Server.ts")!;

    expect(content).toContain("import \"@tsed/oidc-provider\"");
    expect(content).toContain("import {InteractionsCtrl} from \"./controllers/oidc/InteractionsCtrl\";");
    expect(content).toEqual(readFile("data/Server.express.oidc.ts.txt", content));

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

    expect(FakeCliFs.getKeys()).toEqual([
      "./project-name",
      "project-name",
      "project-name/.dockerignore",
      "project-name/.gitignore",
      "project-name/Dockerfile",
      "project-name/README.md",
      "project-name/docker-compose.yml",
      "project-name/package.json",
      "project-name/src",
      "project-name/src/Server.ts",
      "project-name/src/config",
      "project-name/src/config/env",
      "project-name/src/config/env/index.ts",
      "project-name/src/config/index.ts",
      "project-name/src/config/logger",
      "project-name/src/config/logger/index.ts",
      "project-name/src/config/oidc",
      "project-name/src/config/oidc/index.ts",
      "project-name/src/controllers",
      "project-name/src/controllers/HelloWorldController.ts",
      "project-name/src/controllers/oidc",
      "project-name/src/controllers/oidc/InteractionsCtrl.ts",
      "project-name/src/controllers/pages",
      "project-name/src/controllers/pages/IndexController.ts",
      "project-name/src/index.ts",
      "project-name/src/interactions",
      "project-name/src/interactions/ConsentInteraction.ts",
      "project-name/src/interactions/CustomInteraction.ts",
      "project-name/src/interactions/LoginInteraction.ts",
      "project-name/src/models",
      "project-name/src/models/Account.ts",
      "project-name/src/services",
      "project-name/src/services/Accounts.ts",
      "project-name/tsconfig.compile.json",
      "project-name/tsconfig.json",
      "project-name/views",
      "project-name/views/forms",
      "project-name/views/forms/interaction-form.ejs",
      "project-name/views/forms/login-form.ejs",
      "project-name/views/forms/select-account-form.ejs",
      "project-name/views/interaction.ejs",
      "project-name/views/login.ejs",
      "project-name/views/partials",
      "project-name/views/partials/footer.ejs",
      "project-name/views/partials/header.ejs",
      "project-name/views/partials/login-help.ejs",
      "project-name/views/repost.ejs",
      "project-name/views/select_account.ejs",
      "project-name/views/swagger.ejs"
    ]);

    const content = FakeCliFs.entries.get("project-name/src/Server.ts")!;

    expect(content).toContain("import \"@tsed/oidc-provider\"");
    expect(content).toContain("import {InteractionsCtrl} from \"./controllers/oidc/InteractionsCtrl\";");
    expect(content).toEqual(readFile("data/Server.express.oidc.swagger.ts.txt", content));

    const configContent = FakeCliFs.entries.get("project-name/src/config/oidc/index.ts")!;

    expect(configContent).toContain("path: \"/oidc\"");
  });
});
