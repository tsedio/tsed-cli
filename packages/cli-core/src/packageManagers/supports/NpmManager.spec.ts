// @ts-ignore
import {CliPlatformTest} from "@tsed/cli-testing";
import {NpmManager} from "./NpmManager";
import {CliExeca} from "../../services";

async function getManagerFixture() {
  const cliExeca = {
    runSync: vi.fn(),
    run: vi.fn()
  };
  const manager = await CliPlatformTest.invoke<NpmManager>(NpmManager, [
    {
      token: CliExeca,
      use: cliExeca
    }
  ]);
  return {cliExeca, manager};
}
describe("NpmManager", () => {
  beforeEach(() => CliPlatformTest.create());
  afterEach(() => CliPlatformTest.reset());

  describe("add()", () => {
    it("should add dependencies", async () => {
      const {cliExeca, manager} = await getManagerFixture();

      await manager.add(["deps"], {});

      expect(cliExeca.run).toHaveBeenCalledWith("npm", ["install", "--no-production", "--legacy-peer-deps", "--save", "deps"], {});
    });
  });
  describe("addDev()", () => {
    it("should add dependencies", async () => {
      const {cliExeca, manager} = await getManagerFixture();

      await manager.addDev(["deps"], {});

      expect(cliExeca.run).toHaveBeenCalledWith("npm", ["install", "--no-production", "--legacy-peer-deps", "--save-dev", "deps"], {});
    });
  });
  describe("install()", () => {
    it("should run the install cmd", async () => {
      const {cliExeca, manager} = await getManagerFixture();

      await manager.install({});

      expect(cliExeca.run).toHaveBeenCalledWith("npm", ["install", "--no-production", "--legacy-peer-deps"], {});
    });
  });
  describe("runScript()", () => {
    it("should run script", async () => {
      const {cliExeca, manager} = await getManagerFixture();

      await manager.runScript("name", {});

      expect(cliExeca.run).toHaveBeenCalledWith("npm", ["run", "name"], {});
    });
  });
});
