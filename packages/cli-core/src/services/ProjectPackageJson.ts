import {Configuration, Inject, registerProvider} from "@tsed/di";
import {dirname} from "path";
import * as readPkgUp from "read-pkg-up";
import {IPackageJson} from "../interfaces/IPackageJson";

export interface ProjectPackageJson extends IPackageJson {}

export function ProjectPackageJson() {
  return Inject(ProjectPackageJson);
}

registerProvider({
  provide: ProjectPackageJson,
  deps: [Configuration],
  useFactory(configuration: Configuration) {
    const result = readPkgUp.sync({
      cwd: configuration.project?.root
    });

    if (result && result.path) {
      configuration.set("project.root", dirname(result.path));

      return result.packageJson;
    }

    return {
      name: "",
      version: "1.0.0",
      description: "",
      scripts: {},
      dependencies: {},
      devDependencies: {}
    };
  }
});
