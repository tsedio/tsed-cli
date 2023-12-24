import {dirname} from "path";
import {Injectable} from "@tsed/di";
import {BabelRuntime} from "./BabelRuntime";

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
      "@babel/cli": "latest",
      "@babel/core": "latest",
      "@babel/node": "latest",
      "@babel/plugin-proposal-class-properties": "latest",
      "@babel/plugin-proposal-decorators": "latest",
      "@babel/preset-env": "latest",
      "@babel/preset-typescript": "latest",
      "babel-plugin-transform-typescript-metadata": "latest",
      "babel-watch": "latest",
      "babel-loader": "latest",
      webpack: "latest",
      "webpack-cli": "latest"
    };
  }
}
