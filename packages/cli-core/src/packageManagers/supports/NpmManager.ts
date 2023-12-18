import {BaseManager, ManagerCmdOpts} from "./BaseManager";
import {Injectable} from "@tsed/di";
import {Observable} from "rxjs";

@Injectable({
  type: "package:manager"
})
export class NpmManager extends BaseManager {
  readonly name: string = "npm";
  readonly cmd: string = "npm";

  add(deps: string[], options: ManagerCmdOpts): Observable<any> {
    return this.run("install", ["--no-production", "--legacy-peer-deps", "--save", ...deps], options);
  }

  addDev(deps: string[], options: ManagerCmdOpts): Observable<any> {
    return this.run("install", ["--no-production", "--legacy-peer-deps", "--save-dev", ...deps], options);
  }

  install(options: ManagerCmdOpts): Observable<any> {
    return this.run("install", ["--no-production", "--legacy-peer-deps"], options);
  }
}
