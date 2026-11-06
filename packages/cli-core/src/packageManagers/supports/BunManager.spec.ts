// @ts-ignore
import {CliPlatformTest} from "@tsed/cli-testing";
import {firstValueFrom, of, throwError, toArray} from "rxjs";

import {CliExeca} from "../../services/index.js";
import {BunManager} from "./BunManager.js";

async function getManagerFixture() {
  const cliExeca = {
    runSync: vi.fn(),
    run: vi.fn().mockReturnValue(of())
  };
  const manager = await CliPlatformTest.invoke<BunManager>(BunManager, [
    {
      token: CliExeca,
      use: cliExeca
    }
  ]);
  return {cliExeca, manager};
}

describe("BunManager", () => {
  beforeEach(() => CliPlatformTest.create());
  afterEach(() => CliPlatformTest.reset());

  describe("add()", () => {
    it("should add dependencies", async () => {
      const {cliExeca, manager} = await getManagerFixture();

      await manager.add(["deps"], {});

      expect(cliExeca.run).toHaveBeenCalledWith("bun", ["add", "deps"], {});
    });
  });
  describe("addDev()", () => {
    it("should add dependencies", async () => {
      const {cliExeca, manager} = await getManagerFixture();

      await manager.addDev(["deps"], {});

      expect(cliExeca.run).toHaveBeenCalledWith("bun", ["add", "-d", "deps"], {});
    });
  });
  describe("install()", () => {
    it("should run the install cmd", async () => {
      const {cliExeca, manager} = await getManagerFixture();

      await manager.install({});

      expect(cliExeca.run).toHaveBeenCalledWith("bun", ["install"], {});
    });

    it("should retry with --no-cache when bun reports a stale manifest", async () => {
      const {cliExeca, manager} = await getManagerFixture();
      const error = new Error(
        'Command failed with exit code 1: bun install\nerror: No version matching "7.9.0" found for specifier "@tsed/cli-core" (but package exists)'
      );

      cliExeca.run.mockReturnValueOnce(throwError(() => error)).mockReturnValueOnce(of("done"));

      const result = await firstValueFrom(manager.install({}).pipe(toArray()));

      expect(result).toEqual(["done"]);
      expect(cliExeca.run).toHaveBeenNthCalledWith(1, "bun", ["install"], {});
      expect(cliExeca.run).toHaveBeenNthCalledWith(2, "bun", ["install", "--no-cache"], {});
    });

    it("should retry bun add with --no-cache when bun reports a stale manifest", async () => {
      const {cliExeca, manager} = await getManagerFixture();
      const error = new Error('error: No version matching "8.44.13" found for specifier "@tsed/di" (but package exists)');

      cliExeca.run.mockReturnValueOnce(throwError(() => error)).mockReturnValueOnce(of("done"));

      await firstValueFrom(manager.addDev(["deps"], {}).pipe(toArray()));

      expect(cliExeca.run).toHaveBeenNthCalledWith(2, "bun", ["add", "--no-cache", "-d", "deps"], {});
    });

    it("should not retry on other errors", async () => {
      const {cliExeca, manager} = await getManagerFixture();
      const error = new Error("Command failed with exit code 1: bun install\nerror: network down");

      cliExeca.run.mockReturnValueOnce(throwError(() => error));

      await expect(firstValueFrom(manager.install({}).pipe(toArray()))).rejects.toThrow("network down");
      expect(cliExeca.run).toHaveBeenCalledTimes(1);
    });
  });
  describe("runScript()", () => {
    it("should run script", async () => {
      const {cliExeca, manager} = await getManagerFixture();

      await manager.runScript("name", {});

      expect(cliExeca.run).toHaveBeenCalledWith("bun", ["run", "name"], {});
    });
  });
});
