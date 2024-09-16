import {Injectable} from "@tsed/di";

import {NodeRuntime} from "./NodeRuntime.js";

@Injectable({
  type: "runtime"
})
export class SWCRuntime extends NodeRuntime {
  readonly name = "swc";
  readonly order: number = 3;

  files() {
    return [...super.files(), "/init/.swcrc.hbs", "/init/.node-dev.json.hbs"];
  }

  startDev(main: string) {
    return `node-dev ${main}`;
  }

  compile(src: string, out: string) {
    return `swc ${src.replace("/index.ts", "")} --out-dir ${out.replace("/index.js", "")} -s`;
  }

  devDependencies(): Record<string, any> {
    return {
      "@swc/core": "latest",
      "@swc/cli": "latest",
      "@swc/helpers": "latest",
      "@swc-node/register": "latest",
      "node-dev": "latest"
    };
  }
}
