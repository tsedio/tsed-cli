import {Configuration, Injectable} from "@tsed/di";
import * as Fs from "fs-extra";
import * as Listr from "listr";
import {dirname, join} from "path";
import * as readPkgUp from "read-pkg-up";
import {throwError} from "rxjs";
import {catchError} from "rxjs/operators";
import {IPackageJson} from "../interfaces/IPackageJson";
import {CliExeca} from "./CliExeca";

const hasYarn = require("has-yarn");

function getPkgWithUndefinedVersion(deps: any) {
  return Object.entries(deps)
    .filter(([_, version]) => !version)
    .map(([key]) => key);
}

@Injectable()
export class ProjectPackageJson {
  private path: string;
  private raw: IPackageJson = {
    name: "",
    version: "1.0.0",
    description: "",
    scripts: {},
    dependencies: {},
    devDependencies: {}
  };

  constructor(@Configuration() configuration: Configuration, private cliExeca: CliExeca) {
    const result = readPkgUp.sync({
      cwd: configuration.project?.root
    });

    if (result && result.path) {
      configuration.set("project.root", dirname(result.path));

      this.raw = result.packageJson as any;
    }

    this.path = configuration.project?.root;
  }

  private _rewrite = false;

  get rewrite(): boolean {
    return this._rewrite;
  }

  private _reinstall = false;

  get reinstall(): boolean {
    return this._reinstall;
  }

  get name() {
    return this.raw.name;
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

  addDevDependencies(pkg: string, version?: string) {
    this.devDependencies[pkg] = version!;
    this._reinstall = true;
    this._rewrite = true;

    return this;
  }

  addDependencies(pkg: string, version?: string) {
    this.dependencies[pkg] = version!;
    this._reinstall = true;
    this._rewrite = true;

    return this;
  }

  addScript(task: string, cmd: string) {
    this.dependencies[task] = cmd;
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
    return Fs.writeFile(join(this.path, "package.json"), JSON.stringify(this.raw, null, 2), {encoding: "utf8"});
  }

  hasYarn() {
    return hasYarn(dirname(this.path));
  }

  install() {
    return new Listr([
      {
        title: "Write package.json",
        skip: () => {
          return !this.rewrite;
        },
        task: () => this.write()
      },
      ...(this.hasYarn() ? this.installWithYarn() : this.installWithNpm())
    ]);
  }

  private installWithYarn() {
    const devDeps = getPkgWithUndefinedVersion(this.devDependencies);
    const deps = getPkgWithUndefinedVersion(this.dependencies);

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
        task: () => this.cliExeca.run("yarn", ["install", "--frozen-lockfile", "--production=false"]).pipe(errorPipe())
      },
      {
        title: "Add dependencies using Yarn",
        skip: () => !deps.length,
        task: () => this.cliExeca.run("yarn", ["add", ...deps]).pipe(errorPipe())
      },
      {
        title: "Add devDependencies using Yarn",
        skip: () => !devDeps.length,
        task: () => this.cliExeca.run("yarn", ["add", "-D", ...devDeps]).pipe(errorPipe())
      }
    ];
  }

  private installWithNpm() {
    const devDeps = getPkgWithUndefinedVersion(this.devDependencies);
    const deps = getPkgWithUndefinedVersion(this.dependencies);

    return [
      {
        title: "Installing dependencies using npm",
        enabled: () => !this.hasYarn(),
        skip: () => {
          return !this.reinstall;
        },
        task: () => {
          return this.cliExeca.run("npm", ["install", "--no-production"]);
        }
      },
      {
        title: "Add dependencies using npm",
        skip: () => !deps.length,
        task: () => this.cliExeca.run("npm", ["install", "--save", ...deps])
      },
      {
        title: "Add devDependencies using npm",
        skip: () => !devDeps.length,
        task: () => this.cliExeca.run("npm", ["install", "--save-dev", ...devDeps])
      }
    ];
  }
}
