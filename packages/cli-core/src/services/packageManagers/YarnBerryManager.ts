import {Inject, Injectable} from "@tsed/di";
import execa from "execa";
import {Observable} from "rxjs";
import {BaseManager, ManagerCmdOpts, ManagerCmdSyncOpts} from "./BaseManager";
import {join} from "path";
import {CliYaml} from "../CliYaml";

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
    return this.run("add", ["--ignore-engines", ...deps], options);
  }

  addDev(deps: string[], options: ManagerCmdOpts) {
    return this.run("add", ["-D", "--ignore-engines", ...deps], options);
  }

  install(options: {verbose?: boolean} & execa.Options): Observable<any> {
    return this.run("install", [options.verbose && "--verbose"], options);
  }
}
