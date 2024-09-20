import {Inject, Injectable} from "@tsed/di";
import type {Options} from "execa";
import {EMPTY, throwError} from "rxjs";
import {catchError} from "rxjs/operators";

import {ProjectPackageJson} from "../services/ProjectPackageJson.js";
import {isValidVersion} from "../utils/isValidVersion.js";
import {BaseManager} from "./supports/BaseManager.js";
import {BunManager} from "./supports/BunManager.js";
import {NpmManager} from "./supports/NpmManager.js";
import {PNpmManager} from "./supports/PNpmManager.js";
import {YarnBerryManager} from "./supports/YarnBerryManager.js";
import {YarnManager} from "./supports/YarnManager.js";

function mapPackagesWithInvalidVersion(deps: any) {
  const toString = (info: [string, string]) => {
    return info[1] === "latest" ? info[0] : info.join("@");
  };

  return Object.entries(deps)
    .filter(([, version]) => !isValidVersion(version as string))
    .map(toString);
}

export interface InstallOptions {
  packageManager?: string;

  [key: string]: any;
}

@Injectable({
  imports: [YarnManager, YarnBerryManager, NpmManager, PNpmManager, BunManager]
})
export class PackageManagersModule {
  @Inject()
  protected projectPackageJson: ProjectPackageJson;

  constructor(@Inject("package:manager") protected packageManagers: BaseManager[]) {
    this.packageManagers = packageManagers.filter((manager) => manager.has());
  }

  init(options: InstallOptions = {}) {
    const packageManager = this.get(options.packageManager);
    options.packageManager = packageManager.name;

    options = {
      ...options,
      cwd: this.projectPackageJson.dir,
      env: {
        ...process.env,
        GH_TOKEN: this.projectPackageJson.GH_TOKEN
      }
    };

    this.projectPackageJson.write();
    this.projectPackageJson.rewrite = true;

    return packageManager.init(options as any);
  }

  install(options: InstallOptions = {}) {
    const packageManager = this.get(options.packageManager);
    options.packageManager = packageManager.name;

    const devDeps = mapPackagesWithInvalidVersion(this.projectPackageJson.devDependencies);
    const deps = mapPackagesWithInvalidVersion(this.projectPackageJson.dependencies);

    options = {
      ...options,
      cwd: this.projectPackageJson.dir,
      env: {
        ...process.env,
        GH_TOKEN: this.projectPackageJson.GH_TOKEN
      }
    };

    const errorPipe = () =>
      catchError((error: any) => {
        if (error.stderr.startsWith("error Your lockfile needs to be updated")) {
          return throwError(
            new Error(`yarn.lock file is outdated. Run ${packageManager.name}, commit the updated lockfile and try again.`)
          );
        }

        return throwError(error);
      });

    return [
      {
        title: "Write package.json",
        enabled: () => this.projectPackageJson.rewrite,
        task: () => {
          this.projectPackageJson.write();
        }
      },
      {
        title: `Installing dependencies using ${packageManager.name}`,
        skip: () => !this.projectPackageJson.reinstall,
        task: () => packageManager.install(options as any).pipe(errorPipe())
      },
      {
        title: `Add dependencies using ${packageManager.name}`,
        skip: () => !deps.length,
        task: () => packageManager.add(deps, options as any).pipe(errorPipe())
      },
      {
        title: `Add devDependencies using ${packageManager.name}`,
        skip: () => !devDeps.length,
        task: () => packageManager.addDev(devDeps, options as any).pipe(errorPipe())
      },
      {
        title: "Refresh",
        task: () => {
          this.projectPackageJson.refresh();
        }
      }
    ];
  }

  list() {
    return this.packageManagers.map((manager) => manager.name);
  }

  get(name?: string): BaseManager {
    if (this.projectPackageJson.preferences.packageManager) {
      name = this.projectPackageJson.preferences.packageManager;
    }

    name = name || "yarn";

    let selectedPackageManager = this.packageManagers.find((manager) => manager.name === name);

    if (!selectedPackageManager) {
      selectedPackageManager = this.packageManagers.find((manager) => manager.name === "npm")!;
    }

    this.projectPackageJson.setPreference("packageManager", selectedPackageManager.name);

    return selectedPackageManager;
  }

  public runScript(
    scriptName: string,
    {
      ignoreError,
      ...opts
    }: {
      ignoreError?: boolean;
    } & Options &
      Record<string, any> = {}
  ) {
    const options = {
      cwd: this.projectPackageJson.dir,
      ...opts
    };

    const errorPipe = () =>
      catchError((error: any) => {
        if (ignoreError) {
          return EMPTY;
        }

        return throwError(error);
      });

    return this.get().runScript(scriptName, options).pipe(errorPipe());
  }
}
