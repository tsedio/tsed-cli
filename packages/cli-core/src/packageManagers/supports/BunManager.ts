import {Injectable} from "@tsed/di";
import type {Options} from "execa";
import {Observable, throwError} from "rxjs";
import {catchError} from "rxjs/operators";

import {BaseManager, type ManagerCmdOpts} from "./BaseManager.js";

// Bun reports this when its cached package metadata is older than the registry.
const STALE_MANIFEST_ERROR = /No version matching .+ found for specifier/;

@Injectable({
  type: "package:manager"
})
export class BunManager extends BaseManager {
  readonly name = "bun";
  readonly cmd = "bun";

  add(deps: string[], options: ManagerCmdOpts) {
    return this.runWithFreshManifest("add", [...deps], options);
  }

  addDev(deps: string[], options: ManagerCmdOpts) {
    return this.runWithFreshManifest("add", ["-d", ...deps], options);
  }

  install(options: {verbose?: boolean} & Options): Observable<any> {
    return this.runWithFreshManifest("install", [options.verbose && "--verbose"], options);
  }

  /**
   * Runs the command and, if bun fails because of a stale manifest cache,
   * retries once with `--no-cache` so the metadata is fetched from the registry again.
   */
  protected runWithFreshManifest(cmd: string, args: any[], options: ManagerCmdOpts): Observable<any> {
    return this.run(cmd, args, options).pipe(
      catchError((er: any) => {
        const output = [er?.message, er?.stderr, er?.stdout].filter(Boolean).join("\n");

        if (STALE_MANIFEST_ERROR.test(output)) {
          return this.run(cmd, ["--no-cache", ...args], options);
        }

        return throwError(() => er);
      })
    );
  }
}
