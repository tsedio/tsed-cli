import {Configuration} from "@tsed/di";
import readPkgUp from "read-pkg-up";
import {dirname, join} from "path";
import Fs from "fs-extra";

function useReadPkgUp(configuration: Configuration) {
  return !(process.argv.includes("init") && !Fs.existsSync(join(String(configuration.project?.rootDir), "package.json")));
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

export function getPackageJson(configuration: Configuration) {
  if (useReadPkgUp(configuration)) {
    const result = readPkgUp.sync({
      cwd: configuration.project?.rootDir
    });

    if (result && result.path) {
      const pkgPath = dirname(result.path);

      configuration.set("project.root", pkgPath);

      const pkg = Fs.readJsonSync(result.path, {encoding: "utf8"});

      return {...getEmptyPackageJson(configuration), ...pkg} as any;
    }
  }

  return getEmptyPackageJson(configuration);
}
