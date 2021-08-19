import {CliPlatformTest} from "@tsed/cli-testing";
import {CliExeca, CliFs, createSubTasks, createTasksRunner, PackageManager, ProjectPackageJson} from "@tsed/cli-core";
import {join, resolve} from "path";

async function getProjectPackageJsonFixture() {
  const cliExeca = {
    run: jest.fn().mockReturnThis(),
    pipe: jest.fn().mockResolvedValue(undefined)
  };
  const cliFs = {
    writeFileSync: jest.fn()
  };

  const projectPackageJson = await CliPlatformTest.invoke<ProjectPackageJson>(ProjectPackageJson, [
    {
      token: CliExeca,
      use: cliExeca
    },
    {
      token: CliFs,
      use: cliFs
    }
  ]);

  return {projectPackageJson, cliExeca, cliFs};
}

const rootDir = resolve(join(__dirname, "__mock__"));

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
  beforeEach(() =>
    CliPlatformTest.create({
      name: "tsed",
      project: {
        rootDir
      }
    })
  );
  afterEach(() => CliPlatformTest.reset());

  describe("with Yarn", () => {
    it("should read package.json and add dependencies", async () => {
      const {projectPackageJson, cliExeca, cliFs} = await getProjectPackageJsonFixture();

      jest.spyOn(projectPackageJson, "hasYarn").mockReturnValue(true);

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

      expect(projectPackageJson.toJSON()).toEqual({
        _id: "@",
        dependencies: {
          module1: "latest",
          module2: "alpha",
          module3: "6.0.0"
        },
        description: "description",
        devDependencies: {
          "dev-module1": "latest",
          "dev-module2": "alpha",
          "dev-module3": "6.0.0"
        },
        name: "name",
        readme: "ERROR: No README data found!",
        scripts: {
          build: "echo 0"
        },
        tsed: {
          packageManager: "yarn"
        },
        version: "1.0.0"
      });

      // WHEN
      await taskFixtureRunner(() => projectPackageJson.install({packageManager: PackageManager.YARN}));

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
          packageManager: "yarn"
        }
      };

      expect(cliFs.writeFileSync).toHaveBeenCalledWith(resolve(join(rootDir, "package.json")), JSON.stringify(expectedJson, null, 2), {
        encoding: "utf8"
      });

      expect(cliExeca.run).toHaveBeenCalledWith("yarn", ["install", "--production=false"], {
        cwd: rootDir,
        env: process.env
      });
      expect(cliExeca.run).toHaveBeenCalledWith("yarn", ["add", "module1", "module2@alpha"], {
        cwd: rootDir,
        env: process.env
      });
      expect(cliExeca.run).toHaveBeenCalledWith("yarn", ["add", "-D", "dev-module1", "dev-module2@alpha"], {
        cwd: rootDir,
        env: process.env
      });
    });
  });
  describe("with NPM", () => {
    it("should read package.json and add dependencies (asked for yarn, but fallback to npm)", async () => {
      const {projectPackageJson, cliExeca, cliFs} = await getProjectPackageJsonFixture();
      cliExeca.run.mockResolvedValue(undefined);

      jest.spyOn(projectPackageJson, "hasYarn").mockReturnValue(false);

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

      expect(projectPackageJson.getPackageManager(PackageManager.YARN)).toEqual(PackageManager.NPM);

      expect(projectPackageJson.toJSON()).toEqual({
        _id: "@",
        dependencies: {
          module1: "latest",
          module2: "alpha",
          module3: "6.0.0"
        },
        description: "description",
        devDependencies: {
          "dev-module1": "latest",
          "dev-module2": "alpha",
          "dev-module3": "6.0.0"
        },
        name: "name",
        readme: "ERROR: No README data found!",
        scripts: {
          build: "echo 0"
        },
        tsed: {
          packageManager: "yarn"
        },
        version: "1.0.0"
      });

      // WHEN
      await taskFixtureRunner(() => projectPackageJson.install({packageManager: PackageManager.YARN}));

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
          packageManager: "yarn"
        }
      };

      expect(cliFs.writeFileSync).toHaveBeenCalledWith(resolve(join(rootDir, "package.json")), JSON.stringify(expectedJson, null, 2), {
        encoding: "utf8"
      });

      expect(cliExeca.run).toHaveBeenCalledWith("npm", ["install", "--no-production", "--legacy-peer-deps"], {
        cwd: rootDir,
        env: process.env
      });
      expect(cliExeca.run).toHaveBeenCalledWith("npm", ["install", "--save", "--legacy-peer-deps", "module1", "module2@alpha"], {
        cwd: rootDir,
        env: process.env
      });
      expect(cliExeca.run).toHaveBeenCalledWith(
        "npm",
        ["install", "--save-dev", "--legacy-peer-deps", "dev-module1", "dev-module2@alpha"],
        {
          cwd: rootDir,
          env: process.env
        }
      );
    });
    it("should read package.json and add dependencies (asked for npm)", async () => {
      const {projectPackageJson, cliExeca, cliFs} = await getProjectPackageJsonFixture();
      cliExeca.run.mockResolvedValue(undefined);

      jest.spyOn(projectPackageJson, "hasYarn").mockReturnValue(false);

      projectPackageJson.setPreference("packageManager", PackageManager.NPM);

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

      expect(projectPackageJson.toJSON()).toEqual({
        _id: "@",
        dependencies: {
          module1: "latest",
          module2: "alpha",
          module3: "6.0.0"
        },
        description: "description",
        devDependencies: {
          "dev-module1": "latest",
          "dev-module2": "alpha",
          "dev-module3": "6.0.0"
        },
        name: "name",
        readme: "ERROR: No README data found!",
        scripts: {
          build: "echo 0"
        },
        tsed: {
          packageManager: "npm"
        },
        version: "1.0.0"
      });

      // WHEN
      await taskFixtureRunner(() => projectPackageJson.install({packageManager: PackageManager.NPM}));

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
          packageManager: "npm"
        }
      };

      expect(cliFs.writeFileSync).toHaveBeenCalledWith(resolve(join(rootDir, "package.json")), JSON.stringify(expectedJson, null, 2), {
        encoding: "utf8"
      });

      expect(cliExeca.run).toHaveBeenCalledWith("npm", ["install", "--no-production", "--legacy-peer-deps"], {
        cwd: rootDir,
        env: process.env
      });
      expect(cliExeca.run).toHaveBeenCalledWith("npm", ["install", "--save", "--legacy-peer-deps", "module1", "module2@alpha"], {
        cwd: rootDir,
        env: process.env
      });
      expect(cliExeca.run).toHaveBeenCalledWith(
        "npm",
        ["install", "--save-dev", "--legacy-peer-deps", "dev-module1", "dev-module2@alpha"],
        {
          cwd: rootDir,
          env: process.env
        }
      );
    });
  });
});
