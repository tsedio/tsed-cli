import {Inject, Injectable} from "@tsed/di";
import {ProjectPackageJson} from "./ProjectPackageJson";

const runScript = require("@npmcli/run-script");

@Injectable()
export class CliRunScript {
  @Inject()
  projectPackageJson: ProjectPackageJson;

  run(cmd: string, args: string[], options: any = {}) {
    return runScript({
      event: "run",
      ...options,
      cmd: `${cmd} ${args.join(" ")}`,
      path: options.cwd || this.projectPackageJson.dir,
      env: options.env || {},
      stdio: options.stdio || "inherit",
      banner: false
    });
  }
}
