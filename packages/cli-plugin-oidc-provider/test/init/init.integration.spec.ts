import "../../src/index.js";

import {InitCmd, TEMPLATE_DIR} from "@tsed/cli";
import {CliPlatformTest, FakeCliFs} from "@tsed/cli-testing";

describe(
  "Init OIDC Provider project",
  () => {
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

      await CliPlatformTest.initProject({
        oidc: true,
        testing: true,
        oidcBasePath: "/oidc"
      });

      expect(FakeCliFs.getKeys()).toMatchInlineSnapshot(`
      [
        "project-name",
        "project-name/.barrels.json",
        "project-name/.dockerignore",
        "project-name/.gitignore",
        "project-name/.swcrc",
        "project-name/Dockerfile",
        "project-name/README.md",
        "project-name/docker-compose.yml",
        "project-name/nodemon.json",
        "project-name/package.json",
        "project-name/processes.config.cjs",
        "project-name/src/Server.ts",
        "project-name/src/config/config.ts",
        "project-name/src/config/logger/index.ts",
        "project-name/src/config/oidc/index.ts",
        "project-name/src/config/utils/index.ts",
        "project-name/src/controllers/oidc/InteractionsController.spec.ts",
        "project-name/src/controllers/oidc/InteractionsController.ts",
        "project-name/src/controllers/pages/IndexController.ts",
        "project-name/src/controllers/rest/HelloWorldController.ts",
        "project-name/src/index.ts",
        "project-name/src/interactions/ConsentInteraction.spec.ts",
        "project-name/src/interactions/ConsentInteraction.ts",
        "project-name/src/interactions/CustomInteraction.ts",
        "project-name/src/interactions/LoginInteraction.spec.ts",
        "project-name/src/interactions/LoginInteraction.ts",
        "project-name/src/interactions/__mock__/oidcContext.fixture.ts",
        "project-name/src/models/Account.ts",
        "project-name/src/services/Accounts.ts",
        "project-name/tsconfig.base.json",
        "project-name/tsconfig.json",
        "project-name/tsconfig.node.json",
        "project-name/views/consent.ejs",
        "project-name/views/forms/consent-form.ejs",
        "project-name/views/forms/login-form.ejs",
        "project-name/views/forms/select-account-form.ejs",
        "project-name/views/login.ejs",
        "project-name/views/partials/footer.ejs",
        "project-name/views/partials/header.ejs",
        "project-name/views/partials/login-help.ejs",
        "project-name/views/repost.ejs",
        "project-name/views/select_account.ejs",
      ]
    `);

      const content = FakeCliFs.files.get("project-name/src/Server.ts")!;

      expect(content).toContain('import "@tsed/oidc-provider"');
      expect(content).toContain('import { InteractionsController } from "./controllers/oidc/InteractionsController.js";');
      expect(content).toMatchSnapshot();

      const configContent = FakeCliFs.files.get("project-name/src/config/oidc/index.ts")!;

      expect(configContent).toContain('path: "/oidc"');
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
        route: "/rest",
        oidcBasePath: "/oidc"
      });

      expect(FakeCliFs.getKeys()).toMatchSnapshot();

      const content = FakeCliFs.files.get("project-name/src/Server.ts")!;

      expect(content).toContain('import "@tsed/oidc-provider"');
      expect(content).toContain('import { InteractionsController } from "./controllers/oidc/InteractionsController.js";');
      expect(content).toMatchSnapshot();

      const configContent = FakeCliFs.files.get("project-name/src/config/oidc/index.ts")!;

      expect(configContent).toContain('path: "/oidc"');
    });
  },
  {
    timeout: 15000
  }
);
