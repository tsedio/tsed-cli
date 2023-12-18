import {Inject} from "@tsed/di";
import {Observable} from "rxjs";
import execa from "execa";
import {CliExeca} from "../../services/CliExeca";

export type ManagerCmdOpts = {verbose?: boolean} & execa.Options;
export type ManagerCmdSyncOpts = {verbose?: boolean} & execa.SyncOptions;

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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async init(opts: ManagerCmdSyncOpts): Promise<void> {}

  abstract install(options: ManagerCmdOpts): Observable<any>;

  abstract add(deps: string[], options: ManagerCmdOpts): Observable<any>;

  abstract addDev(deps: string[], options: ManagerCmdOpts): Observable<any>;

  runScript(script: string, options: ManagerCmdOpts) {
    return this.run("run", [script], options);
  }

  run(cmd: string, args: any[], options: {verbose?: boolean} & execa.Options<string>) {
    return this.cliExeca.run(this.cmd, [cmd, options.verbose && this.verboseOpt, ...args].filter(Boolean) as string[], options);
  }
}
