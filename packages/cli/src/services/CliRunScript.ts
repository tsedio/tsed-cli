import {ProjectPackageJson} from "@tsed/cli-core";
import {inject, Injectable} from "@tsed/di";

@Injectable()
export class CliRunScript {
  async run(cmd: string, args: string[], options: any = {}) {
    // @ts-ignore
    const mod = await import("@npmcli/run-script");

    return (mod.default || mod)({
      event: "run",
      ...options,
      cmd: `${cmd} ${args.join(" ")}`,
      path: options.cwd || inject(ProjectPackageJson).dir,
      env: options.env || {},
      stdio: options.stdio || "inherit",
      banner: false
    });
  }
}
