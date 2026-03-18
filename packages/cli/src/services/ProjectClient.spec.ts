import {CliFs, inject} from "@tsed/cli-core";
import {CliPlatformTest, FakeCliFs} from "@tsed/cli-testing";

import {ProjectClient} from "./ProjectClient.js";

describe("ProjectClient", () => {
  beforeEach(() =>
    CliPlatformTest.bootstrap({
      project: {
        rootDir: "./project-name",
        srcDir: "src"
      }
    })
  );
  afterEach(() => CliPlatformTest.reset());

  it("should create a ts source file from string content", async () => {
    const project = new ProjectClient({
      rootDir: "./project-name"
    });

    const source = await project.createSource("src/Server.ts", "export class Server {}");

    expect(source?.getBaseName()).toBe("Server.ts");
    expect(source?.getText()).toContain("export class Server");
    expect(FakeCliFs.files.get("project-name/src/Server.ts")).toContain("export class Server");
  });

  it("should create a ts source file from a structure", async () => {
    const project = new ProjectClient({
      rootDir: "./project-name"
    });

    const source = await project.createSource("src/config/config.ts", {
      statements: ["export const config = {};"]
    });

    expect(source?.getBaseName()).toBe("config.ts");
    expect(source?.getText()).toContain("export const config");

    const fs = inject(CliFs);
    const content = await fs.readFile("project-name/src/config/config.ts", "utf8");

    expect(content).toContain("export const config");
  });
});
