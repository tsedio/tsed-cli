import {BaseRuntime} from "./BaseRuntime";
import {Injectable} from "@tsed/di";

@Injectable({
  type: "runtime"
})
export class BunRuntime extends BaseRuntime {
  readonly name = "bun";
  readonly cmd = "bun";

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
