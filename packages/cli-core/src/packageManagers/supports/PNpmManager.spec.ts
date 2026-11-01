// @ts-ignore
import {CliPlatformTest} from "@tsed/cli-testing";

import {CliExeca, CliFs, CliYaml} from "../../services/index.js";
import {PNpmManager} from "./PNpmManager.js";

async function getManagerFixture() {
  const cliExeca = {
    runSync: vi.fn(),
    run: vi.fn(),
    get: vi.fn()
  };
  const cliFs = {
    exists: vi.fn().mockReturnValue(false)
  };
  const cliYaml = {
    read: vi.fn(),
    write: vi.fn()
  };
  const manager = await CliPlatformTest.invoke<PNpmManager>(PNpmManager, [
    {
      token: CliExeca,
      use: cliExeca
    },
    {
      token: CliFs,
      use: cliFs
    },
    {
      token: CliYaml,
      use: cliYaml
    }
  ]);
  return {cliExeca, cliFs, cliYaml, manager};
}

describe("PNpmManager", () => {
  beforeEach(() => CliPlatformTest.create());
  afterEach(() => CliPlatformTest.reset());

  describe("init()", () => {
    it("should approve the build scripts with allowBuilds (pnpm >= 11)", async () => {
      const {cliExeca, cliYaml, manager} = await getManagerFixture();
      cliExeca.get.mockReturnValue("11.17.0\n");

      await manager.init({cwd: "cwd"});

      expect(cliExeca.get).toHaveBeenCalledWith("pnpm", ["--version"], {cwd: "cwd"});
      expect(cliYaml.write).toHaveBeenCalledWith("cwd/pnpm-workspace.yaml", {
        allowBuilds: {"@swc/core": true}
      });
    });

    it("should keep the existing pnpm-workspace.yaml settings", async () => {
      const {cliExeca, cliFs, cliYaml, manager} = await getManagerFixture();
      cliExeca.get.mockReturnValue("11.17.0");
      cliFs.exists.mockReturnValue(true);
      cliYaml.read.mockResolvedValue({
        minimumReleaseAgeExclude: ["@tsed/json-mapper@8.44.13"],
        allowBuilds: {esbuild: false, "@swc/core": "set this to true or false"}
      });

      await manager.init({cwd: "cwd"});

      expect(cliYaml.write).toHaveBeenCalledWith("cwd/pnpm-workspace.yaml", {
        minimumReleaseAgeExclude: ["@tsed/json-mapper@8.44.13"],
        allowBuilds: {esbuild: false, "@swc/core": true}
      });
    });

    it("should approve the build scripts with onlyBuiltDependencies (pnpm 10)", async () => {
      const {cliExeca, cliYaml, manager} = await getManagerFixture();
      cliExeca.get.mockReturnValue("10.12.1");

      await manager.init({cwd: "cwd"});

      expect(cliYaml.write).toHaveBeenCalledWith("cwd/pnpm-workspace.yaml", {
        onlyBuiltDependencies: ["@swc/core"]
      });
    });

    it("should not write pnpm-workspace.yaml for pnpm < 10", async () => {
      const {cliExeca, cliYaml, manager} = await getManagerFixture();
      cliExeca.get.mockReturnValue("9.15.0");

      await manager.init({cwd: "cwd"});

      expect(cliYaml.write).not.toHaveBeenCalled();
    });

    it("should use allowBuilds when the pnpm version can't be read", async () => {
      const {cliExeca, cliYaml, manager} = await getManagerFixture();
      cliExeca.get.mockImplementation(() => {
        throw new Error("pnpm not found");
      });

      await manager.init({cwd: "cwd"});

      expect(cliYaml.write).toHaveBeenCalledWith("cwd/pnpm-workspace.yaml", {
        allowBuilds: {"@swc/core": true}
      });
    });
  });

  describe("add()", () => {
    it("should add dependencies", async () => {
      const {cliExeca, manager} = await getManagerFixture();

      await manager.add(["deps"], {});

      expect(cliExeca.run).toHaveBeenCalledWith("pnpm", ["add", "--save-prod", "deps"], {});
    });
  });
  describe("addDev()", () => {
    it("should add dependencies", async () => {
      const {cliExeca, manager} = await getManagerFixture();

      await manager.addDev(["deps"], {});

      expect(cliExeca.run).toHaveBeenCalledWith("pnpm", ["add", "--save-dev", "deps"], {});
    });
  });
  describe("install()", () => {
    it("should run the install cmd", async () => {
      const {cliExeca, manager} = await getManagerFixture();

      await manager.install({});

      expect(cliExeca.run).toHaveBeenCalledWith("pnpm", ["install", "--dev"], {});
    });
  });
  describe("runScript()", () => {
    it("should run script", async () => {
      const {cliExeca, manager} = await getManagerFixture();

      await manager.runScript("name", {});

      expect(cliExeca.run).toHaveBeenCalledWith("pnpm", ["run", "name"], {});
    });
  });
});
