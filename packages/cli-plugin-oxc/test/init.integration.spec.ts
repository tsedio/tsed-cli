import "../src/index.js";

import {InitCmd, TEMPLATE_DIR} from "@tsed/cli";
import {ProjectPackageJson} from "@tsed/cli-core";
import {CliPlatformTest, FakeCliFs} from "@tsed/cli-testing";
import {inject} from "@tsed/di";

describe("OXC: Init cmd", () => {
  beforeEach(() => {
    return CliPlatformTest.bootstrap({
      templateDir: TEMPLATE_DIR,
      commands: [InitCmd],
      argv: ["init"]
    });
  });
  afterEach(() => CliPlatformTest.reset());

  it("should generate an Oxlint project", async () => {
    await CliPlatformTest.initProject({
      oxlint: true
    });

    expect(FakeCliFs.files.get("project-name/.oxlintrc.json")).toContain('"$schema": "./node_modules/oxlint/configuration_schema.json"');
    expect(FakeCliFs.files.get("project-name/.oxfmtrc.json")).toBeUndefined();

    const packageJson = inject(ProjectPackageJson);

    expect(packageJson.scripts).toMatchObject({
      "test:lint": "oxlint",
      "test:lint:fix": "oxlint --fix"
    });
    expect(packageJson.devDependencies).toMatchObject({
      oxlint: "latest"
    });
    expect(packageJson.devDependencies.oxfmt).toBeUndefined();
  });

  it("should generate Oxfmt and OXC lint-staged configuration when selected", async () => {
    await CliPlatformTest.initProject({
      oxlint: true,
      oxfmt: true,
      lintstaged: true
    });

    expect(FakeCliFs.files.get("project-name/.oxfmtrc.json")).toContain('"$schema": "./node_modules/oxfmt/configuration_schema.json"');
    expect(FakeCliFs.files.get("project-name/.lintstagedrc.json")).toBe(`{
  "**/*.{ts,js}": [
    "oxlint --fix"
  ],
  "*": [
    "oxfmt --no-error-on-unmatched-pattern"
  ]
}\n`);

    const packageJson = inject(ProjectPackageJson);

    expect(packageJson.scripts).toMatchObject({
      "test:format": "oxfmt --check",
      "test:format:fix": "oxfmt"
    });
    expect(packageJson.devDependencies).toMatchObject({
      oxfmt: "latest",
      husky: "latest",
      "lint-staged": "latest"
    });
  });
});
