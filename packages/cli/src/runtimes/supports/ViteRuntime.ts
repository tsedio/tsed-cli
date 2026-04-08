import {injectable} from "@tsed/di";

import {BaseRuntime} from "./BaseRuntime.js";

export class ViteRuntime extends BaseRuntime {
  readonly name = "vite";
  readonly cmd = "node";
  readonly order: number = -1;

  files() {
    return ["vite.config.ts"];
  }

  compile(): string {
    return "tsed build";
  }

  startDev(): string {
    return "tsed dev";
  }

  startProd(args: string): string {
    return `node ${args}`;
  }

  devDependencies(): Record<string, any> {
    return {
      "@tsed/cli": "{{cliVersion}}",
      typescript: "latest",
      vite: "latest"
    };
  }
}

injectable(ViteRuntime).type("runtime");
