import {Injectable} from "@tsed/di";
import execa from "execa";
import {filter, merge} from "rxjs/operators";

require("any-observable/register/rxjs-all");
const streamToObservable = require("@samverschueren/stream-to-observable");

const split = require("split");

@Injectable()
export class CliExeca {
  readonly raw = execa;

  /**
   *
   * @param cmd
   * @param args
   * @param opts
   */
  run(cmd: string, args: string[], opts?: execa.Options) {
    const cp = this.raw(cmd, args, opts);
    const stdout = streamToObservable(cp.stdout!.pipe(split()), {await: cp});
    const stderr = streamToObservable(cp.stderr!.pipe(split()), {await: cp});

    return stdout.pipe(merge(stderr)).pipe(filter(Boolean));
  }

  runSync(cmd: string, args: string[], opts?: execa.SyncOptions) {
    return this.raw.sync(cmd, args, opts);
  }

  async getAsync(cmd: string, args: string[], opts?: execa.SyncOptions) {
    return (await this.raw(cmd, args, opts)).stdout;
  }

  get(cmd: string, args: string[], opts?: execa.SyncOptions) {
    return this.raw.sync(cmd, args, opts).stdout;
  }
}
