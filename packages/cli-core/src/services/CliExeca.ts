import {injectable} from "@tsed/di";
import type {Options, SyncOptions} from "execa";
import {execa, execaSync} from "execa";
import {filter, mergeWith} from "rxjs/operators";
// @ts-ignore
import split from "split";

import {streamToObservable} from "../utils/streamToObservable.js";

export class CliExeca {
  readonly raw = execa;
  readonly rawSync = execaSync;

  /**
   *
   * @param cmd
   * @param args
   * @param opts
   */
  run(cmd: string, args: string[], opts?: Options) {
    const cp = this.raw(cmd, args, opts);
    const stdout = streamToObservable(cp.stdout!.pipe(split()), {await: cp});
    const stderr = streamToObservable(cp.stderr!.pipe(split()), {await: cp});

    return stdout.pipe(mergeWith(stderr)).pipe(filter(Boolean));
  }

  runSync(cmd: string, args: string[], opts?: SyncOptions) {
    return this.rawSync(cmd, args, opts);
  }

  async getAsync(cmd: string, args: readonly string[], opts?: Options) {
    return (await this.raw(cmd, args, opts)).stdout;
  }

  get(cmd: string, args: string[], opts?: SyncOptions) {
    return this.rawSync(cmd, args, opts).stdout;
  }
}

injectable(CliExeca);
