import {
  CliDefaultOptions,
  CliPackageJson,
  Command,
  CommandProvider,
  Inject,
  NpmRegistryClient,
  ProjectPackageJson,
  QuestionOptions
} from "@tsed/cli-core";
import {getValue} from "@tsed/core";
import * as semver from "semver";
import {IGNORE_TAGS, IGNORE_VERSIONS, MINIMAL_TSED_VERSION} from "../../constants";

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

function shouldUpdate(pkg: string) {
  return pkg.includes("@tsed") && !pkg.includes("@tsed/cli") && !pkg.includes("@tsed/logger");
}

@Command({
  name: "update",
  description: "Update all Ts.ED packages used by your project",
  args: {},
  options: {}
})
export class UpdateCmd implements CommandProvider {
  @Inject()
  npmRegistryClient: NpmRegistryClient;

  @Inject()
  projectPackage: ProjectPackageJson;

  @CliPackageJson()
  cliPackage: CliPackageJson;

  private versions: any;

  async $prompt(initialOptions: Partial<UpdateCmdContext>): Promise<QuestionOptions> {
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
    Object.keys(this.projectPackage.dependencies).forEach((pkg: string) => {
      if (shouldUpdate(pkg)) {
        this.projectPackage.addDependency(pkg, ctx.version);
      }
    });

    Object.keys(this.projectPackage.devDependencies).forEach((pkg: string) => {
      if (shouldUpdate(pkg)) {
        this.projectPackage.addDevDependency(pkg, ctx.version);
      }
    });

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
        if (pkg.includes("@tsed/cli-plugin") && isGreaterThan(cliVersion, version)) {
          this.projectPackage.addDevDependency(pkg, cliVersion);
        }
      });
    }

    return [
      {
        title: "Update packages",
        task: () => {
          return this.projectPackage.install();
        }
      }
    ];
  }

  private async getAvailableVersions() {
    const {versions} = await this.npmRegistryClient.info("@tsed/common", 10);
    this.versions = versions;

    return Object.keys(versions)
      .filter((version) => version.split(".")[0] >= MINIMAL_TSED_VERSION)
      .sort((a, b) => (isGreaterThan(a, b) ? -1 : 1))
      .filter((version) => !IGNORE_VERSIONS.includes(version))
      .filter((version) => (IGNORE_TAGS ? !version.match(IGNORE_TAGS) : true))
      .splice(0, 30);
  }

  private async getEligibleCliVersion(tsedVersion: string) {
    let result: any;

    result = await this.npmRegistryClient.info("@tsed/cli-core", 10);

    if (!result) {
      result = await this.npmRegistryClient.info("@tsed/cli", 10);
    }

    let version: string | undefined;

    if (result) {
      const {versions} = result;

      version = Object.keys(versions)
        .sort((a, b) => (isGreaterThan(a, b) ? -1 : 1))
        .find((pkg) => {
          const tsedCore = versions[pkg].devDependencies["@tsed/core"] || versions[pkg].dependencies["@tsed/core"];

          if (tsedCore) {
            return isGreaterThan(tsedVersion, tsedCore);
          }
        });
    }

    return version && isGreaterThan(version, this.cliPackage.version) ? version : this.cliPackage.version;
  }
}
