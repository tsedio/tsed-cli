// @ts-ignore
import {CliPlatformTest} from "@tsed/cli-testing";

import {CliExeca} from "../../services/index.js";
import {YarnManager} from "./YarnManager.js";

async function getManagerFixture() {
  const cliExeca = {
    runSync: vi.fn(),
    run: vi.fn()
  };
  const manager = await CliPlatformTest.invoke<YarnManager>(YarnManager, [
    {
      token: CliExeca,
      use: cliExeca
    }
  ]);
  return {cliExeca, manager};
}

describe("YarnManager", () => {
  beforeEach(() => CliPlatformTest.create());
  afterEach(() => CliPlatformTest.reset());

  describe("add()", () => {
    it("should add dependencies", async () => {
      const {cliExeca, manager} = await getManagerFixture();

      await manager.add(["deps"], {});

      expect(cliExeca.run).toHaveBeenCalledWith("yarn", ["add", "--ignore-engines", "deps"], {});
    });
  });
  describe("addDev()", () => {
    it("should add dependencies", async () => {
      const {cliExeca, manager} = await getManagerFixture();

      await manager.addDev(["deps"], {});

      expect(cliExeca.run).toHaveBeenCalledWith("yarn", ["add", "-D", "--ignore-engines", "deps"], {});
    });
  });
  describe("install()", () => {
    it("should run the install cmd", async () => {
      const {cliExeca, manager} = await getManagerFixture();

      await manager.install({});

      expect(cliExeca.run).toHaveBeenCalledWith("yarn", ["install"], {});
    });
  });
  describe("runScript()", () => {
    it("should run script", async () => {
      const {cliExeca, manager} = await getManagerFixture();

      await manager.runScript("name", {});

      expect(cliExeca.run).toHaveBeenCalledWith("yarn", ["run", "name"], {});
    });
  });
});
