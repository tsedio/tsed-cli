import {Inject, Injectable} from "@tsed/di";
import execa from "execa";
import {join} from "path";
import {Observable} from "rxjs";

import {CliYaml} from "../../services/CliYaml";
import {BaseManager, ManagerCmdOpts, ManagerCmdSyncOpts} from "./BaseManager";

@Injectable({
  type: "package:manager"
})
export class YarnBerryManager extends BaseManager {
  readonly name = "yarn_berry";
  readonly cmd = "yarn";

  @Inject()
  protected cliYaml: CliYaml;

  async init(options: ManagerCmdSyncOpts) {
    // init yarn v1
    this.install(options);

    // then switch write file
    await this.cliYaml.write(join(options.cwd!, ".yarnrc.yml"), {
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

  install(options: {verbose?: boolean} & execa.Options): Observable<any> {
    return this.run("install", [options.verbose && "--verbose"], options);
  }
}
