import {NpmRegistryClient, ProjectPackageJson} from "@tsed/cli-core";
import {CliPlatformTest} from "@tsed/cli-testing";
import {UpdateCmd} from "./UpdateCmd";

const versions = {
  "6.0.0-alpha.4": {
    version: "6.0.0-alpha.4",
    dependencies: {
      "@tsed/logger": "^5.5.0"
    },
    devDependencies: {}
  },
  "6.0.0-alpha.3": {
    version: "5.56.0"
  },
  "6.0.0-alpha.2": {
    version: "5.57.0"
  },
  "6.0.0-alpha.1": {
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
          choices: ["6.0.0-alpha.4", "6.0.0-alpha.3", "6.0.0-alpha.2", "6.0.0-alpha.1"],
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
                "6.0.0-alpha.4": {
                  version: "6.0.0-alpha.4"
                },
                "6.0.0-alpha.3": {
                  version: "6.0.0-alpha.3"
                },
                "6.0.0-alpha.2": {
                  version: "6.0.0-alpha.2"
                },
                "6.0.0-alpha.1": {
                  version: "6.0.0-alpha.1"
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
          if (pkg === "@tsed/cli") {
            return {
              versions: {
                "1.5.0": {
                  version: "1.5.0",
                  devDependencies: {
                    "@tsed/core": "5.80.0"
                  }
                },
                "1.4.0": {
                  version: "1.4.0",
                  devDependencies: {
                    "@tsed/core": "5.55.0"
                  }
                },
                "1.3.0": {
                  version: "1.3.0",
                  devDependencies: {
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
        version: "6.0.0-alpha.4",
        verbose: false,
        rawArgs: []
      });

      expect(command.projectPackage.dependencies).toEqual({
        "@tsed/common": "6.0.0-alpha.4",
        "@tsed/core": "6.0.0-alpha.4",
        "@tsed/di": "6.0.0-alpha.4",
        "@tsed/logger": "^5.5.0"
      });
      expect(command.projectPackage.devDependencies).toEqual({
        "@tsed/cli-plugin-eslint": "1.5.0",
        "@tsed/cli-plugin-typeorm": "1.5.0"
      });
    });
  });
});
