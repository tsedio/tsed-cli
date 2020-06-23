import {CliDefaultOptions, Command, Inject, NpmRegistryClient, ProjectPackageJson, QuestionOptions} from "@tsed/cli-core";
import {getValue} from "@tsed/core";
import * as semver from "semver";

export interface UpdateCmdContext extends CliDefaultOptions {
  version: string;

  [key: string]: any;
}

function cleanVersion(version = "") {
  return version.replace(/[\^~]/, "");
}

function isGreaterThan(a: any, b: string) {
  a = cleanVersion(a);
  b = cleanVersion(b);
  return semver.gt(a, b) || a === b;
}

@Command({
  name: "update",
  description: "Update all Ts.ED packages used by your project",
  args: {},
  options: {
    "--version <version>": {
      type: String,
      description: "Use a specific version of Ts.ED (format: 5.x.x)"
    }
  }
})
export class UpdateCmd {
  @Inject()
  npmRegistryClient: NpmRegistryClient;

  @Inject()
  projectPackage: ProjectPackageJson;

  private versions: any;

  async $prompt(initialOptions: Partial<UpdateCmdContext>): Promise<QuestionOptions> {
    if (initialOptions.version) {
      return [];
    }

    const versions = await this.getAvailableVersions();

    return [
      {
        type: "list",
        name: "version",
        message: "Select a Ts.ED version",
        default: initialOptions.version,
        when: !initialOptions.version,
        choices: versions
      }
    ];
  }

  async $exec(ctx: UpdateCmdContext) {
    const update = (pkg: string) => {
      if (pkg.includes("@tsed") && !pkg.includes("@tsed/cli") && pkg !== "@tsed/logger") {
        this.projectPackage.addDependency(pkg, ctx.version);
      }
    };

    Object.keys(this.projectPackage.dependencies).forEach(update);
    Object.keys(this.projectPackage.devDependencies).forEach(update);

    if (this.projectPackage.dependencies["ts-log-debug"]) {
      this.projectPackage.dependencies["@tsed/logger"] = this.projectPackage.dependencies["ts-log-debug"];
      delete this.projectPackage.dependencies["ts-log-debug"];
      this.projectPackage.reinstall = true;
      this.projectPackage.rewrite = true;
    }

    const projectLoggerVersion = this.projectPackage.dependencies["@tsed/logger"];

    if (projectLoggerVersion) {
      const loggerVersion = getValue("dependencies.@tsed/logger", this.versions[ctx.version], "");

      if (loggerVersion && isGreaterThan(loggerVersion, projectLoggerVersion)) {
        this.projectPackage.addDependency("@tsed/logger", loggerVersion);
      }
    }

    const cliVersion = await this.getEligibleCliVersion(ctx.version);

    if (cliVersion) {
      Object.entries(this.projectPackage.devDependencies).forEach(([pkg, version]) => {
        if (pkg.includes("@tsed/cli") && isGreaterThan(cliVersion, version)) {
          this.projectPackage.addDevDependency(pkg, cliVersion);
        }
      });
    }

    return [];
  }

  private async getAvailableVersions() {
    const {versions} = await this.npmRegistryClient.info("@tsed/common", 10);
    this.versions = versions;

    return Object.keys(versions)
      .filter(version => version.split(".")[0] >= "5")
      .sort((a, b) => (isGreaterThan(a, b) ? -1 : 1))
      .splice(0, 30);
  }

  private async getEligibleCliVersion(tsedVersion: string) {
    const {versions} = await this.npmRegistryClient.info("@tsed/cli-core", 10);

    return Object.keys(versions)
      .sort((a, b) => (isGreaterThan(a, b) ? -1 : 1))
      .find(pkg => {
        if (versions[pkg].dependencies["@tsed/core"]) {
          return isGreaterThan(tsedVersion, versions[pkg].dependencies["@tsed/core"]);
        }
      });
  }
}
