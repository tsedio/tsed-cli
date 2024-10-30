// @ts-ignore
import {CliPlatformTest} from "@tsed/cli-testing";

import {CliFs} from "../services/index.js";
import {PackageManagersModule} from "./PackageManagersModule.js";
import {BunManager} from "./supports/BunManager.js";
import {NpmManager} from "./supports/NpmManager.js";
import {PNpmManager} from "./supports/PNpmManager.js";
import {YarnBerryManager} from "./supports/YarnBerryManager.js";
import {YarnManager} from "./supports/YarnManager.js";

async function getModuleFixture() {
  const yarnManager = {
    name: "yarn",
    has() {
      return true;
    },
    add: vi.fn().mockReturnValue({
      pipe: vi.fn()
    }),
    addDev: vi.fn().mockReturnValue({
      pipe: vi.fn()
    }),
    install: vi.fn().mockReturnValue({
      pipe: vi.fn()
    }),
    init: vi.fn(),
    runScript: vi.fn().mockReturnValue({
      pipe: vi.fn()
    })
  };

  const npmManager = {
    name: "npm",
    has() {
      return true;
    },
    add: vi.fn(),
    addDev: vi.fn(),
    install: vi.fn(),
    runScript: vi.fn()
  };

  const cliFs = {
    exists: vi.fn().mockReturnValue(true),
    writeFileSync: vi.fn(),
    readJsonSync: vi.fn().mockReturnValue({
      scripts: {},
      dependencies: {},
      devDependencies: {}
    })
  };

  const module = await CliPlatformTest.invoke<PackageManagersModule>(PackageManagersModule, [
    {
      token: CliFs,
      use: cliFs
    },
    {
      token: YarnManager,
      use: yarnManager
    },
    {
      token: NpmManager,
      use: npmManager
    },
    {
      token: PNpmManager,
      use: {
        has() {
          return false;
        }
      }
    },
    {
      token: BunManager,
      use: {
        has() {
          return false;
        }
      }
    },
    {
      token: YarnBerryManager,
      use: {
        has() {
          return false;
        }
      }
    }
  ]);

  return {
    module,
    cliFs,
    yarnManager,
    npmManager
  };
}

describe("PackageManagersModule", () => {
  beforeEach(() => CliPlatformTest.create());
  afterEach(() => CliPlatformTest.reset());

  describe("list()", () => {
    it("should return the list of package managers", async () => {
      const {module} = await getModuleFixture();

      const result = module.list();

      expect(result).toEqual(["npm", "yarn"]);
    });
  });

  describe("get()", () => {
    it("should return the package manager (default)", async () => {
      const module = await CliPlatformTest.invoke<PackageManagersModule>(PackageManagersModule);

      const result = module.get();

      expect(result?.name).toEqual("yarn");
    });
    it("should return the package manager (npm)", async () => {
      const module = await CliPlatformTest.invoke<PackageManagersModule>(PackageManagersModule);

      const result = module.get("npm");

      expect(result?.name).toEqual("npm");
    });
    it("should return the package manager (yarn)", async () => {
      const module = await CliPlatformTest.invoke<PackageManagersModule>(PackageManagersModule);

      const result = module.get("yarn");

      expect(result?.name).toEqual("yarn");
    });
    it("should return the package manager (yarn-berry unknown)", async () => {
      const module = await CliPlatformTest.invoke<PackageManagersModule>(PackageManagersModule);

      const result = module.get("yarn-berry");

      expect(result?.name).toEqual("npm");
    });
  });

  describe("init()", () => {
    it("should init a project", async () => {
      const {module, yarnManager, cliFs} = await getModuleFixture();

      module.init({});

      expect(yarnManager.init).toHaveBeenCalledWith({
        cwd: "./tmp",
        env: {
          ...process.env,
          GH_TOKEN: undefined
        },
        packageManager: "yarn"
      });
      expect(cliFs.writeFileSync).toHaveBeenCalledWith("tmp/package.json", expect.any(String), {encoding: "utf8"});
    });
  });

  describe("install()", () => {
    it("should install dependencies", async () => {
      const {module, yarnManager} = await getModuleFixture();

      const result = await module.install({});

      for (const item of result) {
        await item.task();
      }

      expect(yarnManager.install).toHaveBeenCalledWith({
        cwd: "./tmp",
        env: {
          ...process.env
        },
        packageManager: "yarn"
      });
    });
  });

  describe("runScript()", () => {
    it("should run script", async () => {
      const {module, yarnManager} = await getModuleFixture();

      await module.runScript("name", {});

      expect(yarnManager.runScript).toHaveBeenCalledWith("name", {
        cwd: "./tmp"
      });
    });
  });
});
