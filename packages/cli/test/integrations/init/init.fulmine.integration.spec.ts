import {ProjectPackageJson} from "@tsed/cli-core";
// @ts-ignore
import {CliPlatformTest, FakeCliFs} from "@tsed/cli-testing";
import {inject} from "@tsed/di";

import {ArchitectureConvention, InitCmd, PlatformType, ProjectConvention, TEMPLATE_DIR} from "../../../src/index.js";

describe("Init cmd: fulmine.js platform", () => {
  beforeEach(() =>
    CliPlatformTest.bootstrap({
      templateDir: TEMPLATE_DIR,
      commands: [InitCmd],
      argv: ["init"]
    })
  );
  afterEach(() => CliPlatformTest.reset());

  it("should generate a project on PlatformFulmine", async () => {
    CliPlatformTest.setPackageJson({
      name: "",
      version: "1.0.0",
      description: "",
      scripts: {},
      dependencies: {},
      devDependencies: {}
    });

    await CliPlatformTest.exec("init", {
      verbose: false,
      root: ".",
      tsedVersion: "8.47.0",
      rootDir: "./.tmp/init/fulmine",
      production: false,
      rawArgs: [],
      platform: PlatformType.FULMINE,
      architecture: ArchitectureConvention.DEFAULT,
      convention: ProjectConvention.DEFAULT,
      packageManager: "npm",
      projectName: "fulmine",
      features: [],
      srcDir: "src",
      route: "/rest"
    });

    const index = FakeCliFs.files.get("project-name/src/index.ts")!;
    expect(index).toContain('import { PlatformFulmine } from "@tsed/platform-fulmine";');
    expect(index).toContain("PlatformFulmine.bootstrap(Server)");

    const server = FakeCliFs.files.get("project-name/src/Server.ts")!;
    expect(server).toContain("@tsed/platform-fulmine");
    expect(server).toContain("json-parser");

    expect(inject(ProjectPackageJson).dependencies).toMatchObject({
      "@tsed/platform-fulmine": "8.47.0",
      "@tsed/platform-express": "8.47.0",
      "fulmine.js": "latest",
      express: "latest"
    });

    const dockerfile = FakeCliFs.files.get("project-name/Dockerfile")!;
    expect(dockerfile).toContain("ARG NODE_VERSION=24");
    expect(dockerfile).toContain("FROM node:${NODE_VERSION}-trixie-slim AS build");
    expect(dockerfile).toContain("FROM node:${NODE_VERSION}-trixie-slim AS runtime");
    expect(dockerfile).not.toContain("alpine");

    expect(FakeCliFs.getKeys()).toContain("project-name/.agents/skills/fulmine/SKILL.md");
  });
});
