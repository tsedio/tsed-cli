import {Injectable} from "@tsed/di";

import {BaseRuntime} from "./BaseRuntime.js";

@Injectable({
  type: "runtime"
})
export class NodeRuntime extends BaseRuntime {
  readonly name: string = "node";
  readonly cmd: string = "node";
  readonly order: number = 0;

  files() {
    return [".swcrc", "nodemon.json"];
  }

  startDev(main: string) {
    return `nodemon ${main}`;
  }

  startProd(main: string) {
    return `${this.cmd} --import @swc-node/register/esm-register ${main.replace("dist", "src")}`;
  }

  compile(src: string, out: string) {
    return `swc ${src.replace("/index.ts", "")} --out-dir ${out.replace("/index.js", "")} -s  --strip-leading-paths`;
  }

  dependencies(): Record<string, any> {
    return {
      "@swc/core": "latest",
      "@swc/cli": "latest",
      "@swc/helpers": "latest",
      "@swc-node/register": "latest",
      typescript: "latest"
    };
  }

  devDependencies(): Record<string, any> {
    return {
      nodemon: "latest"
    };
  }
}
