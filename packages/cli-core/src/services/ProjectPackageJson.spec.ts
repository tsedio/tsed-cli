import {CliPlatformTest} from "@tsed/cli-testing";
import {CliExeca, CliFs, ProjectPackageJson} from "@tsed/cli-core";

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

const rootDir = __dirname + "/__mock__/";
describe("ProjectPackageJson", () => {
  beforeEach(() =>
    CliPlatformTest.create({
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

      const list = projectPackageJson.install({packageManager: "yarn"});
      list.setRenderer("silent");

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
        version: "1.0.0"
      });

      // WHEN
      await list.run();

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
        readme: "ERROR: No README data found!",
        _id: "@"
      };

      expect(cliFs.writeFileSync).toHaveBeenCalledWith(`${rootDir}package.json`, JSON.stringify(expectedJson, null, 2), {encoding: "utf8"});

      expect(cliExeca.run).toHaveBeenCalledWith("yarn", ["install", "--production=false"], {cwd: rootDir});
      expect(cliExeca.run).toHaveBeenCalledWith("yarn", ["add", "module1", "module2@alpha"], {cwd: rootDir});
      expect(cliExeca.run).toHaveBeenCalledWith("yarn", ["add", "-D", "dev-module1", "dev-module2@alpha"], {cwd: rootDir});
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

      const list = projectPackageJson.install({packageManager: "yarn"});
      list.setRenderer("silent");

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
        version: "1.0.0"
      });

      // WHEN
      await list.run();

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
        readme: "ERROR: No README data found!",
        _id: "@"
      };

      expect(cliFs.writeFileSync).toHaveBeenCalledWith(`${rootDir}package.json`, JSON.stringify(expectedJson, null, 2), {encoding: "utf8"});

      expect(cliExeca.run).toHaveBeenCalledWith("npm", ["install", "--no-production"], {cwd: rootDir});
      expect(cliExeca.run).toHaveBeenCalledWith("npm", ["install", "--save", "module1", "module2@alpha"], {cwd: rootDir});
      expect(cliExeca.run).toHaveBeenCalledWith("npm", ["install", "--save-dev", "dev-module1", "dev-module2@alpha"], {cwd: rootDir});
    });
    it("should read package.json and add dependencies (asked for npm)", async () => {
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

      const list = projectPackageJson.install({packageManager: "npm"});
      list.setRenderer("silent");

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
        version: "1.0.0"
      });

      // WHEN
      await list.run();

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
        readme: "ERROR: No README data found!",
        _id: "@"
      };

      expect(cliFs.writeFileSync).toHaveBeenCalledWith(`${rootDir}package.json`, JSON.stringify(expectedJson, null, 2), {encoding: "utf8"});

      expect(cliExeca.run).toHaveBeenCalledWith("npm", ["install", "--no-production"], {cwd: rootDir});
      expect(cliExeca.run).toHaveBeenCalledWith("npm", ["install", "--save", "module1", "module2@alpha"], {cwd: rootDir});
      expect(cliExeca.run).toHaveBeenCalledWith("npm", ["install", "--save-dev", "dev-module1", "dev-module2@alpha"], {cwd: rootDir});
    });
  });
});
