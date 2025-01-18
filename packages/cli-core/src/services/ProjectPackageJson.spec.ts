import {join, resolve} from "node:path";

// @ts-ignore
import {CliPlatformTest} from "@tsed/cli-testing";

import {CliExeca} from "./CliExeca.js";
import {CliFs} from "./CliFs.js";
import {ProjectPackageJson} from "./ProjectPackageJson.js";

const dir = import.meta.dirname;

async function getProjectPackageJsonFixture() {
  const cliFs = {
    writeFileSync: vi.fn(),
    exists: vi.fn().mockReturnValue(false),
    readJsonSync: vi.fn().mockReturnValue({
      scripts: {},
      dependencies: {},
      devDependencies: {}
    })
  };

  const cliExeca = {};
  const projectPackageJson = await CliPlatformTest.invoke<ProjectPackageJson>(ProjectPackageJson, [
    {
      token: CliFs,
      use: cliFs
    },
    {
      token: CliExeca,
      use: cliExeca
    }
  ]);

  return {
    projectPackageJson,
    cliFs
  };
}

const rootDir = resolve(join(dir, "__mock__"));

describe("ProjectPackageJson", () => {
  beforeEach(() => {
    return CliPlatformTest.create({
      name: "tsed",
      project: {
        rootDir
      }
    });
  });
  afterEach(() => CliPlatformTest.reset());

  it("should add dependencies", async () => {
    const {projectPackageJson, cliFs} = await getProjectPackageJsonFixture();

    projectPackageJson.set("name", "name");
    projectPackageJson.set("version", "1.0.0");
    projectPackageJson.set("description", "description");
    projectPackageJson.setPreference("packageManager", "npm");
    projectPackageJson.setPreference("runtime", "node");

    projectPackageJson.addScripts({
      build: "echo 0"
    });
    projectPackageJson.addDependencies({
      module1: "latest",
      module2: "alpha",
      module3: "6.0.0"
    });

    projectPackageJson.addDevDependencies({
      "dev-module1": "latest",
      "dev-module2": "alpha",
      "dev-module3": "6.0.0"
    });

    // WHEN
    projectPackageJson.write();
    projectPackageJson.refresh();

    const expectedJson = {
      name: "name",
      version: "1.0.0",
      description: "description",
      scripts: {
        build: "echo 0"
      },
      dependencies: {
        module3: "6.0.0"
      },
      devDependencies: {
        "dev-module3": "6.0.0"
      },
      type: "module",
      tsed: {
        packageManager: "npm",
        runtime: "node"
      }
    };

    expect(cliFs.writeFileSync).toHaveBeenCalledWith(resolve(join(rootDir, "package.json")), JSON.stringify(expectedJson, null, 2), {
      encoding: "utf8"
    });
  });
});
