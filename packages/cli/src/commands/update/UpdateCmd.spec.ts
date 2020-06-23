import {NpmRegistryClient, ProjectPackageJson} from "@tsed/cli-core";
import {CliPlatformTest} from "@tsed/cli-testing";
import {UpdateCmd} from "./UpdateCmd";

const versions = {
  "5.58.0": {
    version: "5.58.0",
    dependencies: {
      "@tsed/logger": "^5.5.0"
    }
  },
  "5.56.0": {
    version: "5.56.0"
  },
  "5.57.0": {
    version: "5.57.0"
  },
  "5.55.0": {
    version: "5.55.0"
  }
};
describe("UpdateCmd", () => {
  beforeEach(() => CliPlatformTest.create());
  afterEach(() => CliPlatformTest.reset());
  describe("$prompt()", () => {
    it("should return prompts", async () => {
      const projectPkg = CliPlatformTest.get<ProjectPackageJson>(ProjectPackageJson);
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      projectPkg.raw = {
        name: "project",
        version: "1.9.0",
        description: "",
        scripts: {},
        dependencies: {},
        devDependencies: {}
      };

      const npmClientRegistry = {
        info(pkg: string) {
          if (pkg === "@tsed/common") {
            return {versions};
          }
        }
      };

      const command = await CliPlatformTest.invoke<UpdateCmd>(UpdateCmd, [
        {
          token: NpmRegistryClient,
          use: npmClientRegistry
        }
      ]);
      const context = {};

      const result = await command.$prompt(context);

      expect(result).toEqual([
        {
          choices: ["5.58.0", "5.57.0", "5.56.0", "5.55.0"],
          default: undefined,
          message: "Select a Ts.ED version",
          name: "version",
          type: "list",
          when: true
        }
      ]);
    });
    it("should return empty prompts", async () => {
      const projectPkg = CliPlatformTest.get<ProjectPackageJson>(ProjectPackageJson);
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      projectPkg.raw = {
        name: "project",
        version: "1.9.0",
        description: "",
        scripts: {},
        dependencies: {},
        devDependencies: {}
      };

      const npmClientRegistry = {
        info(pkg: string) {
          if (pkg === "@tsed/common") {
            return {
              versions: {
                "5.58.0": {
                  version: "5.58.0"
                },
                "5.56.0": {
                  version: "5.56.0"
                },
                "5.57.0": {
                  version: "5.57.0"
                },
                "5.55.0": {
                  version: "5.55.0"
                }
              }
            };
          }
        }
      };

      const command = await CliPlatformTest.invoke<UpdateCmd>(UpdateCmd, [
        {
          token: NpmRegistryClient,
          use: npmClientRegistry
        }
      ]);
      const context = {
        version: "5.50.0"
      };

      const result = await command.$prompt(context);

      expect(result).toEqual([]);
    });
  });
  describe("$exec()", () => {
    it("should update dependencies", async () => {
      const npmClientRegistry = {
        info(pkg: string) {
          if (pkg === "@tsed/cli-core") {
            return {
              versions: {
                "1.5.0": {
                  version: "1.5.0",
                  dependencies: {
                    "@tsed/core": "5.80.0"
                  }
                },
                "1.4.0": {
                  version: "1.4.0",
                  dependencies: {
                    "@tsed/core": "5.55.0"
                  }
                },
                "1.3.0": {
                  version: "1.3.0",
                  dependencies: {
                    "@tsed/core": "5.55.0"
                  }
                }
              }
            };
          }
        }
      };

      const command = await CliPlatformTest.invoke<UpdateCmd>(UpdateCmd, [
        {
          token: NpmRegistryClient,
          use: npmClientRegistry
        }
      ]);
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      command.projectPackage.raw = {
        name: "project",
        version: "1.9.0",
        description: "",
        scripts: {},
        dependencies: {
          "@tsed/core": "5.50.1",
          "@tsed/di": "5.50.1",
          "@tsed/common": "5.50.1",
          "ts-log-debug": "5.4.0"
        },
        devDependencies: {
          "@tsed/cli-plugin-typeorm": "1.3.0",
          "@tsed/cli-plugin-eslint": "1.3.0"
        }
      };

      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      command.versions = versions;

      await command.$exec({
        version: "5.58.0",
        verbose: false,
        rawArgs: []
      });

      expect(command.projectPackage.dependencies).toEqual({
        "@tsed/common": "5.58.0",
        "@tsed/core": "5.58.0",
        "@tsed/di": "5.58.0",
        "@tsed/logger": "^5.5.0"
      });
      expect(command.projectPackage.devDependencies).toEqual({
        "@tsed/cli-plugin-eslint": "1.4.0",
        "@tsed/cli-plugin-typeorm": "1.4.0"
      });
    });
  });
});
