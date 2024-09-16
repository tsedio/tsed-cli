import {Injectable} from "@tsed/di";
import execa from "execa";
import {Observable} from "rxjs";

import {BaseManager, ManagerCmdOpts} from "./BaseManager.js";

@Injectable({
  type: "package:manager"
})
export class YarnManager extends BaseManager {
  readonly name = "yarn";
  readonly cmd = "yarn";

  add(deps: string[], options: ManagerCmdOpts) {
    return this.run("add", ["--ignore-engines", ...deps], options);
  }

  addDev(deps: string[], options: ManagerCmdOpts) {
    return this.run("add", ["-D", "--ignore-engines", ...deps], options);
  }

  install(options: {verbose?: boolean} & execa.Options): Observable<any> {
    return this.run("install", [options.verbose && "--verbose"], options);
  }
}
