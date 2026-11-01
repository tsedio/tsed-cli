import {join} from "node:path";

import {inject, Injectable} from "@tsed/di";
import {Observable} from "rxjs";

import {CliFs} from "../../services/CliFs.js";
import {CliYaml} from "../../services/CliYaml.js";
import {BaseManager, type ManagerCmdOpts} from "./BaseManager.js";

/**
 * Dependencies installed by the CLI that need their build scripts to run.
 * pnpm >= 10 blocks build scripts by default, and pnpm >= 11 fails the install (ERR_PNPM_IGNORED_BUILDS)
 * until they are approved in pnpm-workspace.yaml.
 */
const ALLOWED_BUILDS = ["@swc/core"];

@Injectable({
  type: "package:manager"
})
export class PNpmManager extends BaseManager {
  readonly name = "pnpm";
  readonly cmd = "pnpm";
  protected cliYaml = inject(CliYaml);
  protected fs = inject(CliFs);

  async init(options: ManagerCmdOpts) {
    const major = this.getMajorVersion(options);

    // pnpm < 10 runs every build script
    if (major !== undefined && major < 10) {
      return;
    }

    const file = join(String(options.cwd!), "pnpm-workspace.yaml");
    const workspace: Record<string, any> = (this.fs.exists(file) && ((await this.cliYaml.read(file)) as Record<string, any>)) || {};

    if (major === 10) {
      workspace.onlyBuiltDependencies = [...new Set([...(workspace.onlyBuiltDependencies || []), ...ALLOWED_BUILDS])];
    } else {
      // pnpm >= 11 replaced onlyBuiltDependencies by allowBuilds
      workspace.allowBuilds = {
        ...workspace.allowBuilds,
        ...Object.fromEntries(ALLOWED_BUILDS.map((name) => [name, true]))
      };
    }

    await this.cliYaml.write(file, workspace);
  }

  add(deps: string[], options: ManagerCmdOpts): Observable<any> {
    return this.run("add", ["--save-prod", ...deps], options);
  }

  addDev(deps: string[], options: ManagerCmdOpts): Observable<any> {
    return this.run("add", ["--save-dev", ...deps], options);
  }

  install(options: ManagerCmdOpts): Observable<any> {
    return this.run("install", ["--dev"].filter(Boolean), options);
  }

  protected getMajorVersion(options: ManagerCmdOpts): number | undefined {
    try {
      const version = String(this.cliExeca.get(this.cmd, ["--version"], {cwd: options.cwd}) || "");
      const major = parseInt(version.trim().split(".")[0], 10);

      return Number.isNaN(major) ? undefined : major;
    } catch {
      return undefined;
    }
  }
}
