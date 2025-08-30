import {NpmRegistryClient, ProjectPackageJson} from "@tsed/cli-core";
// @ts-ignore
import {CliPlatformTest} from "@tsed/cli-testing";

import {UpdateCmd} from "./UpdateCmd.js";

const versions = {
  "8.0.0-alpha.4": {
    version: "6.0.0-alpha.4",
    dependencies: {
      "@tsed/logger": "^5.5.0"
    },
    devDependencies: {}
  },
  "8.0.0-alpha.3": {
    version: "5.56.0"
  },
  "8.0.0-alpha.2": {
    version: "5.57.0"
  },
  "8.0.0-alpha.1": {
    version: "5.55.0"
  }
};
describe.skip("UpdateCmd", () => {
  beforeEach(() => CliPlatformTest.create());
  afterEach(() => CliPlatformTest.reset());
  describe("$prompt()", () => {
    it("should return prompts", async () => {
      const projectPkg = CliPlatformTest.get<ProjectPackageJson>(ProjectPackageJson);
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
          if (pkg === "@tsed/platform-http") {
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
          choices: ["8.0.0-alpha.4", "8.0.0-alpha.3", "8.0.0-alpha.2", "8.0.0-alpha.1"],
          default: undefined,
          message: "Select a Ts.ED version",
          name: "version",
          type: "list",
          when: true
        }
      ]);
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

      const projectPackageJson = {
        dependencies: {
          "@tsed/core": "5.50.1",
          "@tsed/di": "5.50.1",
          "@tsed/platform-http": "5.50.1",
          "@tsed/logger": "5.4.0"
        },
        devDependencies: {
          "@tsed/cli-plugin-typeorm": "1.3.0",
          "@tsed/cli-plugin-eslint": "1.3.0"
        },
        addDependency(name: string, version: string) {
          this.dependencies[name] = version;
        },
        addDevDependency(name: string, version: string) {
          this.devDependencies[name] = version;
        },
        install() {}
      };

      const command = await CliPlatformTest.invoke<UpdateCmd>(UpdateCmd, [
        {
          token: NpmRegistryClient,
          use: npmClientRegistry
        },
        {
          token: ProjectPackageJson,
          use: projectPackageJson
        }
      ]);

      // @ts-ignore
      command.versions = versions;

      await command.$exec({
        version: "8.0.0-alpha.4",
        verbose: false,
        rawArgs: []
      });

      // @ts-ignore
      expect(command.projectPackage.dependencies).toEqual({
        "@tsed/platform-http": "8.0.0-alpha.4",
        "@tsed/core": "8.0.0-alpha.4",
        "@tsed/di": "8.0.0-alpha.4",
        "@tsed/logger": "^5.5.0"
      });
      // @ts-ignore
      expect(command.projectPackage.devDependencies).toEqual({
        "@tsed/cli-plugin-eslint": "1.5.0",
        "@tsed/cli-plugin-typeorm": "1.5.0"
      });
    });
  });
});
