import {CliFs, createSubTasks, createTasksRunner, ProjectPackageJson} from "@tsed/cli-core";
import {CliPlatformTest} from "@tsed/cli-testing";
import {join, resolve} from "path";
import filedirname from "filedirname";
import {NpmManager} from "./packageManagers/NpmManager";
import {YarnManager} from "./packageManagers/YarnManager";
import {PNpmManager} from "./packageManagers/PNpmManager";

const [, dir] = filedirname();

async function getProjectPackageJsonFixture({hasYarn = true, hasPnpm = true} = {}) {
  const cliFs = {
    writeFileSync: jest.fn(),
    exists: jest.fn().mockReturnValue(false),
    readJsonSync: jest.fn().mockReturnValue({scripts: {}, dependencies: {}, devDependencies: {}})
  };

  const npmManager = {
    name: "npm",
    add: jest.fn().mockReturnThis(),
    addDev: jest.fn().mockReturnThis(),
    install: jest.fn().mockReturnThis(),
    init: jest.fn().mockReturnThis(),
    has: jest.fn().mockReturnValue(true),
    pipe: jest.fn()
  };

  const yarnManager = {
    name: "yarn",
    add: jest.fn().mockReturnThis(),
    addDev: jest.fn().mockReturnThis(),
    install: jest.fn().mockReturnThis(),
    init: jest.fn().mockReturnThis(),
    has: jest.fn().mockReturnValue(hasYarn),
    pipe: jest.fn()
  };

  const pnpmManager = {
    name: "pnpm",
    add: jest.fn().mockReturnThis(),
    addDev: jest.fn().mockReturnThis(),
    install: jest.fn().mockReturnThis(),
    init: jest.fn().mockReturnThis(),
    has: jest.fn().mockReturnValue(hasPnpm),
    pipe: jest.fn()
  };

  const projectPackageJson = await CliPlatformTest.invoke<ProjectPackageJson>(ProjectPackageJson, [
    {
      token: CliFs,
      use: cliFs
    },
    {
      token: NpmManager,
      use: npmManager
    },
    {
      token: YarnManager,
      use: yarnManager
    },
    {
      token: PNpmManager,
      use: pnpmManager
    }
  ]);

  return {
    projectPackageJson,
    cliFs,
    packageManager: {
      npm: npmManager,
      yarn: yarnManager,
      pnpm: pnpmManager
    } as any
  };
}

const rootDir = resolve(join(dir, "__mock__"));

function taskFixtureRunner(cb: any) {
  return createTasksRunner(
    [
      {
        title: "test",
        task: createSubTasks(cb, {concurrent: false})
      }
    ],
    {
      concurrent: false
    }
  );
}

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

  it.each([
    {
      manager: "yarn",
      hasYarn: true,
      hasPnpm: true,
      expected: "yarn"
    },
    {
      manager: "yarn",
      hasYarn: false,
      hasPnpm: false,
      expected: "npm"
    },
    {
      manager: "npm",
      hasYarn: false,
      hasPnpm: false,
      expected: "npm"
    },
    {
      manager: "pnpm",
      hasYarn: false,
      hasPnpm: true,
      expected: "pnpm"
    },
    {
      manager: "pnpm",
      hasYarn: false,
      hasPnpm: false,
      expected: "npm"
    }
  ])(
    "should use package manager $expected to install project (asked: $manager, hasYarn: $hasYarn, hasPnpm: $hasPnpm, expected: $expected)",
    async ({manager, hasYarn, hasPnpm, expected}) => {
      const {projectPackageJson, cliFs, packageManager} = await getProjectPackageJsonFixture({hasYarn, hasPnpm});

      projectPackageJson.set("name", "name");
      projectPackageJson.set("version", "1.0.0");
      projectPackageJson.set("description", "description");

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
      await taskFixtureRunner(() => projectPackageJson.install({packageManager: manager as any}));

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
        tsed: {
          packageManager: expected
        }
      };

      const opts = {
        cwd: rootDir,
        env: {...process.env, GH_TOKEN: undefined},
        packageManager: expected
      };

      expect(cliFs.writeFileSync).toHaveBeenCalledWith(resolve(join(rootDir, "package.json")), JSON.stringify(expectedJson, null, 2), {
        encoding: "utf8"
      });
      expect(projectPackageJson.packageManager(manager).name).toEqual(expected);
      expect(packageManager[expected].install).toHaveBeenCalledWith(opts);
      expect(packageManager[expected].add).toHaveBeenCalledWith(["module1", "module2@alpha"], opts);
      expect(packageManager[expected].addDev).toHaveBeenCalledWith(["dev-module1", "dev-module2@alpha"], opts);
    }
  );
});
