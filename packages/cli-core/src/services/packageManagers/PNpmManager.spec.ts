import {CliPlatformTest} from "@tsed/cli-testing";
import {PNpmManager} from "./PNpmManager";
import {CliExeca} from "../CliExeca";

async function getManagerFixture() {
  const cliExeca = {
    runSync: jest.fn(),
    run: jest.fn()
  };
  const [manager] = await Promise.all([
    CliPlatformTest.invoke<PNpmManager>(PNpmManager, [
      {
        token: CliExeca,
        use: cliExeca
      }
    ])
  ]);
  return {cliExeca, manager};
}

describe("PNpmManager", () => {
  beforeEach(() => CliPlatformTest.create());
  afterEach(() => CliPlatformTest.reset());

  describe("runCmd()", () => {
    it("should return the runCmd", async () => {
      const {manager} = await getManagerFixture();

      const result = manager.runCmd;

      expect(result).toEqual("pnpm run");
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
