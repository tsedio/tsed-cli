import {dirname} from "node:path";

import {injectable} from "@tsed/di";

import {NodeRuntime} from "./NodeRuntime.js";

export class BabelRuntime extends NodeRuntime {
  readonly name: string = "babel";
  readonly order: number = 1;

  isCompiled() {
    return false;
  }

  files() {
    return [".babelrc"];
  }

  startDev(main: string): string {
    return `babel-watch --extensions .ts ${main}`;
  }

  startProd(args: string) {
    return `${this.cmd} ${args}`;
  }

  compile(src: string, out: string) {
    return `tsc && babel ${dirname(src)} --out-dir ${dirname(out)} --extensions ".ts,.tsx" --source-maps inline`;
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
      "@babel/plugin-proposal-object-rest-spread": "latest",
      "babel-plugin-transform-typescript-metadata": "latest",
      "babel-watch": "latest",
      typescript: "latest"
    };
  }
}

injectable(BabelRuntime).type("runtime");
