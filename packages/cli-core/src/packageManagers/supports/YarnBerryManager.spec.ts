// @ts-ignore
import {CliPlatformTest} from "@tsed/cli-testing";
import {YarnBerryManager} from "./YarnBerryManager";
import {CliExeca, CliYaml} from "../../services";

async function getManagerFixture() {
  const cliExeca = {
    runSync: vi.fn(),
    run: vi.fn()
  };
  const cliYaml = {
    read: vi.fn(),
    write: vi.fn()
  };
  const manager = await CliPlatformTest.invoke<YarnBerryManager>(YarnBerryManager, [
    {
      token: CliExeca,
      use: cliExeca
    },
    {
      token: CliYaml,
      use: cliYaml
    }
  ]);
  return {cliExeca, cliYaml, manager};
}

describe("YarnBerryManager", () => {
  beforeEach(() => CliPlatformTest.create());
  afterEach(() => CliPlatformTest.reset());

  describe("has()", () => {
    it("should return true", async () => {
      const {manager} = await getManagerFixture();

      const result = manager.has();

      expect(result).toEqual(true);
    });

    it("should return false", async () => {
      const {manager, cliExeca} = await getManagerFixture();
      cliExeca.runSync.mockImplementation(() => {
        throw new Error();
      });

      const result = manager.has();

      expect(result).toEqual(false);
    });
  });

  describe("init()", () => {
    it("should init project", async () => {
      const {cliExeca, cliYaml, manager} = await getManagerFixture();

      vi.spyOn(manager, "install").mockResolvedValue([] as never);

      await manager.init({
        cwd: "cwd"
      });

      expect(manager.install).toHaveBeenCalledWith({
        cwd: "cwd"
      });
      expect(cliExeca.runSync).toHaveBeenCalledWith("yarn", ["set", "version", "berry"]);
      expect(cliYaml.write).toHaveBeenCalledWith("cwd/.yarnrc.yml", {nodeLinker: "node-modules"});
    });
  });
  describe("add()", () => {
    it("should add dependencies", async () => {
      const {cliExeca, manager} = await getManagerFixture();

      await manager.add(["deps"], {});

      expect(cliExeca.run).toHaveBeenCalledWith("yarn", ["add", "deps"], {});
    });
  });
  describe("addDev()", () => {
    it("should add dependencies", async () => {
      const {cliExeca, manager} = await getManagerFixture();

      await manager.addDev(["deps"], {});

      expect(cliExeca.run).toHaveBeenCalledWith("yarn", ["add", "-D", "deps"], {});
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
