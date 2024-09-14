import {Injectable} from "@tsed/di";

import {BaseRuntime} from "./BaseRuntime";

@Injectable({
  type: "runtime"
})
export class BunRuntime extends BaseRuntime {
  readonly name = "bun";
  readonly cmd = "bun";
  readonly order: number = 4;

  compile(src: string, out: string) {
    return `${this.cmd} build --target=bun ${src} --outfile=${out}`;
  }

  startDev(main: string) {
    return `${this.cmd} --watch ${main}`;
  }

  startProd(args: string) {
    return `${this.cmd} ${args}`;
  }
}
