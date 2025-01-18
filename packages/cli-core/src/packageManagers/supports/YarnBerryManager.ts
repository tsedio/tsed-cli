import {join} from "node:path";

import {inject, Injectable} from "@tsed/di";
import {Observable} from "rxjs";

import {CliFs} from "../../services/CliFs.js";
import {CliYaml} from "../../services/CliYaml.js";
import {BaseManager, type ManagerCmdOpts} from "./BaseManager.js";

@Injectable({
  type: "package:manager"
})
export class YarnBerryManager extends BaseManager {
  readonly name = "yarn_berry";
  readonly cmd = "yarn";
  protected verboseOpt = "";
  protected cliYaml = inject(CliYaml);
  protected fs = inject(CliFs);

  async init(options: ManagerCmdOpts) {
    const lockFile = join(String(options.cwd!), "yarn.lock");

    if (!this.fs.exists(lockFile)) {
      this.fs.writeFileSync(lockFile, "");
    }

    // init yarn v1
    try {
      await this.install(options).toPromise();
    } catch (er) {}

    // then switch write file
    await this.cliYaml.write(join(String(options.cwd!), ".yarnrc.yml"), {
      nodeLinker: "node-modules"
    });

    // then switch to berry
    this.cliExeca.runSync(this.cmd, ["set", "version", "berry"]);
  }

  add(deps: string[], options: ManagerCmdOpts) {
    return this.run("add", [...deps], options);
  }

  addDev(deps: string[], options: ManagerCmdOpts) {
    return this.run("add", ["-D", ...deps], options);
  }

  install(options: ManagerCmdOpts): Observable<any> {
    return this.run("install", [], options);
  }
}
