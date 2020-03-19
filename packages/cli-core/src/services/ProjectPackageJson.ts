import {getValue} from "@tsed/core";
import {Configuration, Inject, Injectable} from "@tsed/di";
import * as Fs from "fs-extra";
import * as Listr from "listr";
import {dirname, join} from "path";
import * as readPkgUp from "read-pkg-up";
import {Observable, throwError} from "rxjs";
import {catchError} from "rxjs/operators";
import {IPackageJson} from "../interfaces/IPackageJson";
import {CliExeca} from "./CliExeca";
import {NpmRegistryClient} from "./NpmRegistryClient";

const hasYarn = require("has-yarn");

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
  return !(process.argv.includes("init") && !Fs.existsSync(join(configuration.project?.rootDir, "package.json")));
}

function getPackageJson(configuration: Configuration) {
  if (useReadPkgUp(configuration)) {
    const result = readPkgUp.sync({
      cwd: configuration.project?.rootDir
    });

    if (result && result.path) {
      configuration.set("project.root", dirname(result.path));

      return {...result.packageJson} as any;
    }
  }

  return getEmptyPackageJson(configuration);
}

function getPkgWithUndefinedVersion(deps: any) {
  return Object.entries(deps)
    .filter(([_, version]) => !version)
    .map(([key]) => key);
}

export interface IInstallOptions {
  packageManager?: "npm" | "yarn";
}

function getPackageWithLatest(deps: any) {
  return Object.entries(deps).filter(([_, version]) => version === "latest");
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

@Injectable()
export class ProjectPackageJson {
  @Inject(CliExeca)
  protected cliExeca: CliExeca;

  @Inject(NpmRegistryClient)
  protected npmRegistryClient: NpmRegistryClient;

  private raw: IPackageJson = {
    name: "",
    version: "1.0.0",
    description: "",
    scripts: {},
    dependencies: {},
    devDependencies: {}
  };

  constructor(@Configuration() private configuration: Configuration) {
    this.raw = getPackageJson(configuration);
  }

  private _rewrite = false;

  get rewrite(): boolean {
    return this._rewrite;
  }

  private _reinstall = false;

  get reinstall(): boolean {
    return this._reinstall;
  }

  get path() {
    return join(this.dir, "package.json");
  }

  get dir() {
    return this.configuration.project?.rootDir;
  }

  set dir(dir: string) {
    this.configuration.project.rootDir = dir;

    this.raw = getPackageJson(this.configuration);
  }

  get name() {
    return this.raw.name;
  }

  set name(name: string) {
    this.raw.name = name;
    this._rewrite = true;
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

  addDevDependency(pkg: string, version?: string) {
    this.devDependencies[pkg] = version!;
    this._reinstall = true;
    this._rewrite = true;

    return this;
  }

  addDevDependencies(modules: {[key: string]: string | undefined}, scope: object = {}) {
    Object.entries(modules).forEach(([pkg, version]) => {
      this.addDevDependency(
        pkg,
        (version || "").replace(/{{([\w.]+)}}/gi, (match, key) => getValue(key, scope))
      );
    });

    return this;
  }

  addDependency(pkg: string, version?: string) {
    this.dependencies[pkg] = version!;
    this._reinstall = true;
    this._rewrite = true;

    return this;
  }

  addDependencies(modules: {[key: string]: string | undefined}, scope: object = {}) {
    Object.entries(modules).forEach(([pkg, version]) => {
      this.addDependency(
        pkg,
        (version || "").replace(/{{([\w.]+)}}/gi, (match, key) => getValue(key, scope))
      );
    });

    return this;
  }

  addScript(task: string, cmd: string) {
    this.scripts[task] = cmd;
    this._rewrite = true;

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
    this._rewrite = true;

    return this;
  }

  set(key: string, value: any) {
    this.raw[key] = value;

    this._rewrite = true;

    if (["dependencies", "devDependencies", "peerDependencies"].includes(key)) {
      this._reinstall = true;
    }
  }

  get(key: string) {
    return this.raw[key];
  }

  write() {
    this.raw.devDependencies = sortKeys(this.raw.devDependencies);
    this.raw.dependencies = sortKeys(this.raw.dependencies);
    this._rewrite = false;

    return Fs.writeFileSync(this.path, JSON.stringify(this.raw, null, 2), {encoding: "utf8"});
  }

  hasYarn() {
    return hasYarn(this.dir);
  }

  install(options: IInstallOptions = {}) {
    options.packageManager = options.packageManager || (this.hasYarn() ? "yarn" : "npm");

    const shouldResolve = !!getPackageWithLatest(this.allDependencies).length;

    return new Listr(
      [
        {
          title: "Resolve versions",
          skip: () => {
            return !this.rewrite || !shouldResolve;
          },
          task: () => this.resolve()
        },
        {
          title: "Write package.json",
          skip: () => {
            return !this.rewrite;
          },
          task: () => this.write()
        },
        ...(options.packageManager === "yarn" ? this.installWithYarn() : this.installWithNpm())
      ],
      {concurrent: false}
    );
  }

  protected resolve() {
    return new Observable(observer => {
      const packages = getPackageWithLatest(this.allDependencies);
      let completed = 0;

      observer.next(`${completed}/${packages.length} resolved`);

      const promises = packages.map(async ([pkg]) => {
        const info = await this.npmRegistryClient.info(pkg);
        const version = info["dist-tags"].latest;

        if (this.raw.dependencies[pkg]) {
          this.raw.dependencies[pkg] = version;
        }

        if (this.raw.devDependencies[pkg]) {
          this.raw.devDependencies[pkg] = version;
        }
        completed++;
        observer.next(`[${completed}/${packages.length}] Resolving packages...`);
      });

      Promise.all(promises).then(() => {
        observer.next(`[${completed}/${packages.length}] Resolving packages...`);
        observer.complete();
      });
    });
  }

  protected installWithYarn() {
    const devDeps = getPkgWithUndefinedVersion(this.devDependencies);
    const deps = getPkgWithUndefinedVersion(this.dependencies);
    const options = {
      cwd: this.dir
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
        task: () => this.cliExeca.run("yarn", ["install", "--production=false"], options).pipe(errorPipe())
      },
      {
        title: "Add dependencies using Yarn",
        skip: () => !deps.length,
        task: () => this.cliExeca.run("yarn", ["add", ...deps], options).pipe(errorPipe())
      },
      {
        title: "Add devDependencies using Yarn",
        skip: () => !devDeps.length,
        task: () => this.cliExeca.run("yarn", ["add", "-D", ...devDeps], options).pipe(errorPipe())
      },
      {
        title: "Clean",
        task() {
          this._reinstall = false;
        }
      }
    ];
  }

  protected installWithNpm() {
    const devDeps = getPkgWithUndefinedVersion(this.devDependencies);
    const deps = getPkgWithUndefinedVersion(this.dependencies);
    const options = {
      cwd: this.dir
    };

    return [
      {
        title: "Installing dependencies using npm",
        enabled: () => !this.hasYarn(),
        skip: () => {
          return !this.reinstall;
        },
        task: () => {
          return this.cliExeca.run("npm", ["install", "--no-production"], options);
        }
      },
      {
        title: "Add dependencies using npm",
        skip: () => !deps.length,
        task: () => this.cliExeca.run("npm", ["install", "--save", ...deps], options)
      },
      {
        title: "Add devDependencies using npm",
        skip: () => !devDeps.length,
        task: () => this.cliExeca.run("npm", ["install", "--save-dev", ...devDeps], options)
      },
      {
        title: "Clean",
        task() {
          this._reinstall = false;
        }
      }
    ];
  }
}
