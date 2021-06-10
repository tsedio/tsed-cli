import {getValue, setValue} from "@tsed/core";
import {Configuration, Inject, Injectable} from "@tsed/di";
import * as Fs from "fs-extra";
import {dirname, join} from "path";
import * as readPkgUp from "read-pkg-up";
import * as semver from "semver";
import {EMPTY, throwError} from "rxjs";
import {catchError} from "rxjs/operators";
import {PackageJson} from "../interfaces/PackageJson";
import {CliExeca} from "./CliExeca";
import {CliFs} from "./CliFs";
import {createTasks} from "../utils/createTasksRunner";
import {PackageManager, ProjectPreferences} from "../interfaces/ProjectPreferences";

export interface InstallOptions {
  packageManager?: PackageManager;

  [key: string]: any;
}

function getEmptyPackageJson(configuration: Configuration) {
  return {
    name: configuration.name,
    version: "1.0.0",
    description: "",
    scripts: {},
    dependencies: {},
    devDependencies: {}
  };
}

function useReadPkgUp(configuration: Configuration) {
  return !(process.argv.includes("init") && !Fs.existsSync(join(String(configuration.project?.rootDir), "package.json")));
}

function getPackageJson(configuration: Configuration) {
  if (useReadPkgUp(configuration)) {
    const result = readPkgUp.sync({
      cwd: configuration.project?.rootDir
    });

    if (result && result.path) {
      configuration.set("project.root", dirname(result.path));

      return {...getEmptyPackageJson(configuration), ...result.packageJson} as any;
    }
  }

  return getEmptyPackageJson(configuration);
}

function mapPackagesWithInvalidVersion(deps: any) {
  const toString = (info: [string, string]) => {
    return info[1] === "latest" ? info[0] : info.join("@");
  };

  return Object.entries(deps)
    .filter(([, version]) => !semver.valid(version as string))
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

function mapPackagesWithValidVersion(deps: any) {
  return Object.entries(deps).reduce((deps, [key, version]: [string, string]) => {
    if (semver.valid(version)) {
      return {
        ...deps,
        [key]: version
      };
    }

    return deps;
  }, {});
}

function defaultPreferences(pkg?: any): Record<string, any> {
  return {
    packageManager: getValue(pkg, "scripts.build", "").includes("npm ") ? PackageManager.NPM : PackageManager.YARN
  };
}

@Injectable()
export class ProjectPackageJson {
  public rewrite = false;
  public reinstall = false;
  private GH_TOKEN: string;

  @Inject(CliExeca)
  protected cliExeca: CliExeca;
  @Inject(CliFs)
  protected fs: CliFs;
  private raw: PackageJson;

  constructor(@Configuration() private configuration: Configuration) {
    this.setRaw({
      name: "",
      version: "1.0.0",
      description: "",
      scripts: {},
      dependencies: {},
      devDependencies: {}
    });
    this.read();
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

  toJSON() {
    return this.raw;
  }

  read() {
    this.setRaw(getPackageJson(this.configuration));
  }

  setRaw(pkg: any) {
    const projectPreferences = this.configuration.defaultProjectPreferences;
    const preferences = getValue(pkg, this.configuration.name);

    this.raw = {
      ...pkg,
      [this.configuration.name]: {
        ...defaultPreferences(pkg),
        ...(projectPreferences && projectPreferences(pkg)),
        ...preferences
      }
    };
  }

  getRunCmd() {
    return this.preferences.packageManager === "npm" ? "npm run" : "yarn run";
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
    this.raw.devDependencies = sortKeys(this.raw.devDependencies);
    this.raw.dependencies = sortKeys(this.raw.dependencies);
    this.rewrite = false;

    const json = {
      ...this.raw,
      dependencies: {
        ...mapPackagesWithValidVersion(this.raw.dependencies)
      },
      devDependencies: {
        ...mapPackagesWithValidVersion(this.raw.devDependencies)
      },
      readme: undefined,
      _id: undefined
    };

    return this.fs.writeFileSync(this.path, JSON.stringify(json, null, 2), {encoding: "utf8"});
  }

  hasYarn() {
    try {
      this.cliExeca.runSync(PackageManager.YARN, ["--version"]);

      return true;
    } catch (er) {
      return false;
    }
  }

  install(options: InstallOptions = {}) {
    const packageManager = this.getPackageManager(options.packageManager);

    const tasks = packageManager === "yarn" ? this.installWithYarn(options) : this.installWithNpm(options);

    return createTasks(
      [
        {
          title: "Write package.json",
          enabled: () => this.rewrite,
          task: () => this.write()
        },
        ...tasks,
        {
          title: "Clean",
          task: () => {
            this.reinstall = false;
            this.rewrite = false;
            this.read();
          }
        }
      ],
      {...(options as any), concurrent: false}
    );
  }

  /**
   * Import a module from the project workspace
   * @param mod
   */
  async importModule(mod: string) {
    return this.fs.importModule(mod, this.dir);
  }

  public runScript(npmTask: string, ignoreError = false) {
    const options = {
      cwd: this.dir
    };
    const errorPipe = () =>
      catchError((error: any) => {
        if (ignoreError) {
          return EMPTY;
        }

        return throwError(error);
      });

    return this.cliExeca.run(this.getPackageManager(), ["run", npmTask], options).pipe(errorPipe());
  }

  getPackageManager(packageManager?: PackageManager): PackageManager {
    if (this.preferences.packageManager) {
      packageManager = this.preferences.packageManager;
    }

    packageManager = packageManager || PackageManager.YARN;

    if (packageManager === PackageManager.YARN && !this.hasYarn()) {
      packageManager = PackageManager.NPM;
    }

    return packageManager;
  }

  setGhToken(GH_TOKEN: string) {
    this.GH_TOKEN = GH_TOKEN;
  }

  protected installWithYarn({verbose}: any) {
    const devDeps = mapPackagesWithInvalidVersion(this.devDependencies);
    const deps = mapPackagesWithInvalidVersion(this.dependencies);
    const options = {
      cwd: this.dir,
      env: {
        ...process.env,
        GH_TOKEN: this.GH_TOKEN
      }
    };

    const errorPipe = () =>
      catchError((error: any) => {
        if (error.stderr.startsWith("error Your lockfile needs to be updated")) {
          return throwError(new Error("yarn.lock file is outdated. Run yarn, commit the updated lockfile and try again."));
        }

        return throwError(error);
      });

    return [
      {
        title: "Installing dependencies using Yarn",
        skip: () => !this.reinstall,
        task: () =>
          this.cliExeca
            .run(PackageManager.YARN, ["install", "--production=false", verbose && "--verbose"].filter(Boolean), options)
            .pipe(errorPipe())
      },
      {
        title: "Add dependencies using Yarn",
        skip: () => !deps.length,
        task: () =>
          this.cliExeca.run(PackageManager.YARN, ["add", verbose && "--verbose", ...deps].filter(Boolean), options).pipe(errorPipe())
      },
      {
        title: "Add devDependencies using Yarn",
        skip: () => !devDeps.length,
        task: () =>
          this.cliExeca
            .run(PackageManager.YARN, ["add", "-D", verbose && "--verbose", ...devDeps].filter(Boolean), options)
            .pipe(errorPipe())
      }
    ];
  }

  protected installWithNpm({verbose}: any) {
    const devDeps = mapPackagesWithInvalidVersion(this.devDependencies);
    const deps = mapPackagesWithInvalidVersion(this.dependencies);
    const options = {
      cwd: this.dir,
      env: {
        ...process.env,
        GH_TOKEN: this.GH_TOKEN
      }
    };

    return [
      {
        title: "Installing dependencies using npm",
        skip: () => {
          return !this.reinstall;
        },
        task: () => {
          return this.cliExeca.run(PackageManager.NPM, ["install", "--no-production", verbose && "--verbose"].filter(Boolean), options);
        }
      },
      {
        title: "Add dependencies using npm",
        skip: () => !deps.length,
        task: () => this.cliExeca.run(PackageManager.NPM, ["install", "--save", verbose && "--verbose", ...deps].filter(Boolean), options)
      },
      {
        title: "Add devDependencies using npm",
        skip: () => !devDeps.length,
        task: () =>
          this.cliExeca.run(PackageManager.NPM, ["install", "--save-dev", verbose && "--verbose", ...devDeps].filter(Boolean), options)
      }
    ];
  }
}
