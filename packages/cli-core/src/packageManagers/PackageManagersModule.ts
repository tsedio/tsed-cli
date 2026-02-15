import type {Task} from "@tsed/cli-tasks";
import {inject, injectable, injectMany} from "@tsed/di";
import {EMPTY, throwError} from "rxjs";
import {catchError} from "rxjs/operators";

import {ProjectPackageJson} from "../services/ProjectPackageJson.js";
import {isValidVersion} from "../utils/isValidVersion.js";
import {BaseManager, type ManagerCmdOpts} from "./supports/BaseManager.js";
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

export class PackageManagersModule {
  protected projectPackageJson = inject(ProjectPackageJson);
  protected packageManagers: BaseManager[] = injectMany<BaseManager>("package:manager").filter((manager) => {
    return manager.has();
  });

  init(options: InstallOptions = {}) {
    const packageManager = this.get(options.packageManager);
    options.packageManager = packageManager.name;

    options = {
      ...options,
      cwd: this.projectPackageJson.cwd,
      env: {
        ...process.env,
        GH_TOKEN: this.projectPackageJson.GH_TOKEN
      }
    };

    this.projectPackageJson.write();
    this.projectPackageJson.rewrite = true;

    return packageManager.init(options as any);
  }

  task(title: string, ctx: InstallOptions = {}): Task {
    return {
      title,
      type: "progress",
      task: () => this.install(ctx)
    };
  }

  install(options: InstallOptions = {}): Task[] {
    const packageManager = this.get(options.packageManager);
    options.packageManager = packageManager.name;

    const devDeps = mapPackagesWithInvalidVersion(this.projectPackageJson.devDependencies);
    const deps = mapPackagesWithInvalidVersion(this.projectPackageJson.dependencies);

    options = {
      ...options,
      cwd: this.projectPackageJson.cwd,
      env: {
        ...process.env,
        GH_TOKEN: this.projectPackageJson.GH_TOKEN
      }
    };

    return [
      {
        title: "Write package.json",
        skip: () => !this.projectPackageJson.rewrite,
        task: () => {
          this.projectPackageJson.write();
        }
      },
      {
        title: `Installing dependencies using ${packageManager.name}`,
        skip: () => !this.projectPackageJson.reinstall,
        task: () => packageManager.install(options as any)
      },
      {
        title: `Add dependencies using ${packageManager.name}`,
        enabled: !!deps.length,
        task: () => packageManager.add(deps, options as any)
      },
      {
        title: `Add devDependencies using ${packageManager.name}`,
        enabled: !!devDeps.length,
        task: () => packageManager.addDev(devDeps, options as any)
      },
      {
        title: `Installing dependencies using ${packageManager.name}`,
        skip: () => !this.projectPackageJson.reinstall,
        task: () => packageManager.install(options as any)
      },
      {
        title: "Refresh",
        task: () => {
          return this.projectPackageJson.refresh();
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
    } & ManagerCmdOpts &
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

injectable(PackageManagersModule).imports([YarnBerryManager, YarnManager, NpmManager, PNpmManager, BunManager]);
