import {Injectable} from "@tsed/di";
import {NodeRuntime} from "./NodeRuntime";
import {dirname} from "path";

@Injectable({
  type: "runtime"
})
export class BabelRuntime extends NodeRuntime {
  readonly name: string = "babel";
  readonly order: number = 1;

  files() {
    return ["/init/.babelrc.hbs"];
  }

  startDev(main: string): string {
    return `babel-watch --extensions .ts ${main}`;
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
      "babel-plugin-transform-typescript-metadata": "latest",
      "babel-watch": "latest"
    };
  }
}
