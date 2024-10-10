// @ts-ignore
import runScript from "@npmcli/run-script";
import {inject, Injectable} from "@tsed/di";

import {ProjectPackageJson} from "./ProjectPackageJson.js";

@Injectable()
export class CliRunScript {
  run(cmd: string, args: string[], options: any = {}) {
    return runScript({
      event: "run",
      ...options,
      cmd: `${cmd} ${args.join(" ")}`,
      path: options.cwd || inject(ProjectPackageJson).dir,
      env: options.env || {},
      stdio: options.stdio || "inherit",
      banner: false
    });
  }
}
