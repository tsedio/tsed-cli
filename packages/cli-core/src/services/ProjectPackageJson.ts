import {getValue, setValue} from "@tsed/core";
import {Configuration, Inject, Injectable} from "@tsed/di";
import {dirname, join} from "path";
import {EMPTY, throwError} from "rxjs";
import {catchError} from "rxjs/operators";
import {PackageJson} from "../interfaces/PackageJson";
import {ProjectPreferences} from "../interfaces/ProjectPreferences";
import {CliFs} from "./CliFs";
import {isValidVersion} from "../utils/isValidVersion";
import {Options} from "execa";
import {BaseManager} from "./packageManagers/BaseManager";
import {YarnManager} from "./packageManagers/YarnManager";
import {YarnBerryManager} from "./packageManagers/YarnBerryManager";
import {NpmManager} from "./packageManagers/NpmManager";
import {PNpmManager} from "./packageManagers/PNpmManager";
import readPkgUp from "read-pkg-up";

export interface InstallOptions {
  packageManager?: string;

  [key: string]: any;
}

function mapPackagesWithInvalidVersion(deps: any) {
  const toString = (info: [string, string]) => {
    return info[1] === "latest" ? info[0] : info.join("@");
  };

  return Object.entries(deps)
    .filter(([, version]) => !isValidVersion(version as string))
    .map(toString);
}

function sortKeys(obj: any) {
  return Object.entries(obj)
    .sort((k1, k2) => {
      return k1[0] < k2[0] ? -1 : 1;
    })
    .reduce((obj, [key, value]) => {
      return {
        ...obj,
        [key]: value
      };
    }, {});
}

function mapPackages(deps: any) {
  return Object.entries(deps).reduce(
    (deps, [key, version]: [string, string]) => {
      if (isValidVersion(version)) {
        deps.valid[key] = version;
      } else {
        deps.invalid[key] = version;
      }

      return deps;
    },
    {valid: {}, invalid: {}} as {valid: Record<string, string>; invalid: Record<string, string>}
  );
}

@Injectable({
  imports: [YarnManager, YarnBerryManager, NpmManager, PNpmManager]
})
export class ProjectPackageJson {
  public rewrite = false;
  public reinstall = false;

  private GH_TOKEN: string;
  private raw: PackageJson;

  constructor(
    @Configuration() private configuration: Configuration,
    protected fs: CliFs,
    @Inject("package:manager") protected packageManagers: BaseManager[]
  ) {
    this.setRaw({
      name: "",
      version: "1.0.0",
      description: "",
      scripts: {},
      dependencies: {},
      devDependencies: {}
    });
    this.read();
    this.packageManagers = packageManagers.filter((manager) => manager.has());
  }

  get path() {
    return join(this.dir, "package.json");
  }

  get dir() {
    return String(this.configuration.project?.rootDir);
  }

  set dir(dir: string) {
    this.configuration.project.rootDir = dir;

    this.read();
  }

  get name() {
    return this.raw.name;
  }

  set name(name: string) {
    this.raw.name = name;
    this.rewrite = true;
  }

  get version() {
    return this.raw.version;
  }

  get description() {
    return this.raw.description;
  }

  get scripts() {
    return this.raw.scripts;
  }

  get dependencies() {
    return this.raw.dependencies;
  }

  get devDependencies() {
    return this.raw.devDependencies;
  }

  get allDependencies(): {[key: string]: string} {
    return {
      ...(this.dependencies || {}),
      ...(this.devDependencies || {})
    };
  }

  get preferences(): ProjectPreferences {
    return this.raw[this.configuration.name];
  }

  get availablePackageManagers() {
    return this.packageManagers.map((manager) => manager.name);
  }

  toJSON() {
    return this.raw;
  }

  read() {
    const pkg = this.getPackageJson();
    this.setRaw(pkg);
    return this;
  }

  setRaw(pkg: any) {
    const projectPreferences = this.configuration.defaultProjectPreferences;
    const preferences = getValue(pkg, this.configuration.name);

    this.raw = {
      ...pkg,
      [this.configuration.name]: {
        ...(projectPreferences && projectPreferences(pkg)),
        ...preferences
      }
    };
  }

  packageManager(name?: string): BaseManager {
    if (this.preferences.packageManager) {
      name = this.preferences.packageManager;
    }

    name = name || "yarn";

    let selectedPackageManager = this.packageManagers.find((manager) => manager.name === name);

    if (!selectedPackageManager) {
      selectedPackageManager = this.packageManagers.find((manager) => manager.name === "npm")!;
    }

    this.setPreference("packageManager", selectedPackageManager.name);

    return selectedPackageManager;
  }

  getRunCmd() {
    return this.packageManager()!.runCmd;
  }

  addDevDependency(pkg: string, version?: string) {
    this.devDependencies[pkg] = version!;
    this.reinstall = true;
    this.rewrite = true;

    return this;
  }

  addDevDependencies(modules: {[key: string]: string | undefined}, scope: any = {}) {
    const replacer = (match: any, key: string) => getValue(key, scope);
    Object.entries(modules).forEach(([pkg, version]) => {
      this.addDevDependency(pkg, (version || "").replace(/{{([\w.]+)}}/gi, replacer));
    });

    return this;
  }

  addDependency(pkg: string, version?: string) {
    this.dependencies[pkg] = version!;
    this.reinstall = true;
    this.rewrite = true;

    return this;
  }

  addDependencies(modules: {[key: string]: string | undefined}, ctx: any = {}) {
    const replacer = (match: any, key: string) => getValue(key, ctx);

    Object.entries(modules).forEach(([pkg, version]) => {
      this.addDependency(pkg, (version || "").replace("{{tsedVersion}}", ctx.tsedVersion).replace(/{{([\w.]+)}}/gi, replacer));
    });

    return this;
  }

  addScript(task: string, cmd: string) {
    this.scripts[task] = cmd;
    this.rewrite = true;

    return this;
  }

  addScripts(scripts: {[key: string]: string}) {
    Object.entries(scripts).forEach(([task, cmd]) => {
      this.addScript(task, cmd);
    });

    return this;
  }

  add(key: string, data: any) {
    this.raw[key] = data;
    this.rewrite = true;

    return this;
  }

  setPreference(key: keyof ProjectPreferences, value: any) {
    setValue(this.raw, `${this.configuration.name}.${key}`, value);
    this.rewrite = true;

    return;
  }

  set(key: string, value: any) {
    this.raw[key] = value;

    this.rewrite = true;

    if (["dependencies", "devDependencies", "peerDependencies"].includes(key)) {
      this.reinstall = true;
    }
  }

  get(key: string) {
    return this.raw[key];
  }

  write() {
    const originalPkg = this.getPackageJson();
    const {valid: dependencies, invalid: pendingDependencies} = mapPackages(this.raw.dependencies);
    const {valid: devDependencies, invalid: pendingDevDependencies} = mapPackages(this.raw.devDependencies);

    this.rewrite = false;

    this.raw = {
      ...originalPkg,
      ...this.raw,
      scripts: {
        ...(originalPkg.scripts || {}),
        ...(this.raw.scripts || {})
      },
      dependencies: sortKeys({
        ...originalPkg.dependencies,
        ...dependencies
      }),
      devDependencies: sortKeys({
        ...originalPkg.devDependencies,
        ...devDependencies
      }),
      readme: undefined,
      _id: undefined
    };

    this.fs.writeFileSync(this.path, JSON.stringify(this.raw, null, 2), {encoding: "utf8"});

    this.raw.dependencies = {
      ...this.raw.dependencies,
      ...pendingDependencies
    };

    this.raw.devDependencies = {
      ...this.raw.devDependencies,
      ...pendingDevDependencies
    };

    return this;
  }

  init(options: InstallOptions = {}) {
    const packageManager = this.packageManager(options.packageManager);
    options.packageManager = packageManager.name;

    options = {
      ...options,
      cwd: this.dir,
      env: {
        ...process.env,
        GH_TOKEN: this.GH_TOKEN
      }
    };

    this.write();
    this.rewrite = true;

    return packageManager.init(options as any);
  }

  install(options: InstallOptions = {}) {
    const packageManager = this.packageManager(options.packageManager);
    options.packageManager = packageManager.name;

    const devDeps = mapPackagesWithInvalidVersion(this.devDependencies);
    const deps = mapPackagesWithInvalidVersion(this.dependencies);

    options = {
      ...options,
      cwd: this.dir,
      env: {
        ...process.env,
        GH_TOKEN: this.GH_TOKEN
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
        enabled: () => this.rewrite,
        task: () => {
          this.write();
        }
      },
      {
        title: `Installing dependencies using ${packageManager.name}`,
        skip: () => !this.reinstall,
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
          this.refresh();
        }
      }
    ];
  }

  /**
   * Import a module from the project workspace
   * @param mod
   */
  async importModule(mod: string) {
    return this.fs.importModule(mod, this.dir);
  }

  public runScript(scriptName: string, {ignoreError, ...opts}: {ignoreError?: boolean} & Options & Record<string, any> = {}) {
    const options = {
      cwd: this.dir,
      ...opts
    };

    const errorPipe = () =>
      catchError((error: any) => {
        if (ignoreError) {
          return EMPTY;
        }

        return throwError(error);
      });

    return this.packageManager().runScript(scriptName, options).pipe(errorPipe());
  }

  setGhToken(GH_TOKEN: string) {
    this.GH_TOKEN = GH_TOKEN;
  }

  refresh() {
    this.reinstall = false;
    this.rewrite = false;

    const cwd = this.configuration.get("project.rootDir");
    const pkgPath = join(String(cwd), "package.json");

    const pkg = this.fs.readJsonSync(pkgPath, {encoding: "utf8"});

    pkg.scripts = {
      ...this.raw.scripts,
      ...pkg.scripts
    };

    pkg.dependencies = {
      ...this.raw.dependencies,
      ...pkg.dependencies
    };

    pkg.devDependencies = {
      ...this.raw.devDependencies,
      ...pkg.devDependencies
    };

    pkg[this.configuration.name] = {
      ...this.raw[this.configuration.name],
      ...pkg[this.configuration.name]
    };

    this.raw = pkg;

    return this;
  }

  protected getPackageJson() {
    const cwd = this.configuration.get("project.rootDir");
    const disableReadUpPkg = this.configuration.get("disableReadUpPkg");
    const name = this.configuration.get("name");

    const pkgPath = join(String(cwd), "package.json");
    const fileExists = this.fs.exists(pkgPath);

    if (!disableReadUpPkg && !fileExists) {
      const result = readPkgUp.sync({
        cwd
      });

      if (result && result.path) {
        const pkgPath = dirname(result.path);
        this.configuration.set("project.root", pkgPath);

        const pkg = this.fs.readJsonSync(result.path, {encoding: "utf8"});

        return {...this.getEmptyPackageJson(name), ...pkg} as any;
      }
    }

    if (disableReadUpPkg && fileExists) {
      const pkg = this.fs.readJsonSync(pkgPath, {encoding: "utf8"});
      this.configuration.set("project.root", pkgPath);

      return {...this.getEmptyPackageJson(name), ...pkg} as any;
    }

    return this.getEmptyPackageJson(name);
  }

  protected getEmptyPackageJson(name: string) {
    return {
      name,
      version: "1.0.0",
      description: "",
      scripts: {},
      dependencies: {},
      devDependencies: {}
    };
  }
}
