import {Inject} from "@tsed/di";
import type {Options, SyncOptions} from "execa";
import {Observable} from "rxjs";

import {CliExeca} from "../../services/CliExeca.js";

export type ManagerCmdOpts = {verbose?: boolean} & Omit<Options, "verbose">;
export type ManagerCmdSyncOpts = {verbose?: boolean} & Omit<SyncOptions, "verbose">;

export abstract class BaseManager {
  abstract readonly name: string;
  abstract readonly cmd: string;

  protected verboseOpt = "--verbose";

  @Inject(CliExeca)
  protected cliExeca: CliExeca;

  has() {
    try {
      this.cliExeca.runSync(this.cmd, ["--version"]);

      return true;
    } catch (er) {
      return false;
    }
  }

  async init(opts: ManagerCmdOpts): Promise<void> {}

  abstract install(options: ManagerCmdOpts): Observable<any>;

  abstract add(deps: string[], options: ManagerCmdOpts): Observable<any>;

  abstract addDev(deps: string[], options: ManagerCmdOpts): Observable<any>;

  runScript(script: string, options: ManagerCmdOpts) {
    return this.run("run", [script], options);
  }

  run(cmd: string, args: any[], options: ManagerCmdOpts) {
    return this.cliExeca.run(this.cmd, [cmd, options.verbose && this.verboseOpt, ...args].filter(Boolean) as string[], options);
  }
}
