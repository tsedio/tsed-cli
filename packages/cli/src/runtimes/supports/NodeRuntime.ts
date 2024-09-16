import {Injectable} from "@tsed/di";

import {BaseRuntime} from "./BaseRuntime.js";

@Injectable({
  type: "runtime"
})
export class NodeRuntime extends BaseRuntime {
  readonly name: string = "node";
  readonly cmd: string = "node";
  readonly order: number = 0;

  devDependencies(): Record<string, any> {
    return {
      "ts-node": "latest",
      "ts-node-dev": "latest"
    };
  }

  compile(src: string, out: string) {
    return `tsc --project tsconfig.compile.json`;
  }

  startDev(main: string) {
    return `tsnd --inspect --exit-child --cls --ignore-watch node_modules --respawn --transpile-only ${main}`;
  }

  startProd(args: string) {
    return `${this.cmd} ${args}`;
  }
}
