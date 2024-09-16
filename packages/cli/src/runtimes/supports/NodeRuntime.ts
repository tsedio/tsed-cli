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
    return ["/init/.swcrc.hbs", "/init/nodemon.json.hbs"];
  }

  startDev(main: string) {
    return `nodemon --import @swc-node/register/register-esm ${main}`;
  }

  startProd(main: string) {
    return `${this.cmd} --import @swc-node/register/register-esm ${main.replace("dist", "src")}`;
  }

  compile(src: string, out: string) {
    return `swc ${src.replace("/index.ts", "")} --out-dir ${out.replace("/index.js", "")} -s`;
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
