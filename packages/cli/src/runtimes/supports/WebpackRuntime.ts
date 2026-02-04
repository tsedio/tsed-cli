import {dirname} from "node:path";

import {Injectable} from "@tsed/di";

import {BabelRuntime} from "./BabelRuntime.js";

@Injectable({
  type: "runtime"
})
export class WebpackRuntime extends BabelRuntime {
  readonly name = "webpack";
  readonly order: number = 2;

  isCompiled() {
    return true;
  }

  files() {
    return [...super.files(), "webpack.config.js"];
  }

  compile(src: string, out: string): string {
    return "tsc && cross-env NODE_ENV=production webpack";
  }

  startProd(main: string): string {
    return `${this.cmd} ${dirname(main)}/app.bundle.js`;
  }

  devDependencies() {
    return {
      ...super.devDependencies(),
      typescript: "latest",
      "babel-loader": "latest",
      webpack: "latest",
      "webpack-cli": "latest"
    };
  }
}
