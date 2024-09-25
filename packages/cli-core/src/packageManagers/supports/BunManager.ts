import {Injectable} from "@tsed/di";
import type {Options} from "execa";
import {Observable} from "rxjs";

import {BaseManager, type ManagerCmdOpts} from "./BaseManager.js";

@Injectable({
  type: "package:manager"
})
export class BunManager extends BaseManager {
  readonly name = "bun";
  readonly cmd = "bun";

  add(deps: string[], options: ManagerCmdOpts) {
    return this.run("add", [...deps], options);
  }

  addDev(deps: string[], options: ManagerCmdOpts) {
    return this.run("add", ["-d", ...deps], options);
  }

  install(options: {verbose?: boolean} & Options): Observable<any> {
    return this.run("install", [options.verbose && "--verbose"], options);
  }
}
