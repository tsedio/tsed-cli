import {Injectable} from "@tsed/di";
import {dirname} from "path";

import {BabelRuntime} from "./BabelRuntime.js";

@Injectable({
  type: "runtime"
})
export class WebpackRuntime extends BabelRuntime {
  readonly name = "webpack";
  readonly order: number = 2;

  files() {
    return [...super.files(), "/init/webpack.config.js.hbs"];
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
      "babel-loader": "latest",
      webpack: "latest",
      "webpack-cli": "latest"
    };
  }
}
