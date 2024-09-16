import {Injectable} from "@tsed/di";
import {Observable} from "rxjs";

import {BaseManager, ManagerCmdOpts} from "./BaseManager.js";

@Injectable({
  type: "package:manager"
})
export class PNpmManager extends BaseManager {
  readonly name = "pnpm";
  readonly cmd = "pnpm";

  add(deps: string[], options: ManagerCmdOpts): Observable<any> {
    return this.run("add", ["--save-prod", ...deps], options);
  }

  addDev(deps: string[], options: ManagerCmdOpts): Observable<any> {
    return this.run("add", ["--save-dev", ...deps], options);
  }

  install(options: ManagerCmdOpts): Observable<any> {
    return this.run("install", ["--dev"].filter(Boolean), options);
  }
}
