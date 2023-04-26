import {Injectable} from "@tsed/di";
import execa from "execa";
import {Observable} from "rxjs";
import {BaseManager, ManagerCmdOpts} from "./BaseManager";

@Injectable({
  type: "package:manager"
})
export class YarnManager extends BaseManager {
  readonly name = "yarn";
  readonly cmd = "yarn";

  add(deps: string[], options: ManagerCmdOpts) {
    return this.run("add", deps, options);
  }

  addDev(deps: string[], options: ManagerCmdOpts) {
    return this.run("add", ["-D", ...deps], options);
  }

  install(options: {verbose?: boolean} & execa.Options): Observable<any> {
    return this.run("install", [options.verbose && "--verbose"], options);
  }
}
