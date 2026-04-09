import {injectable} from "@tsed/di";

import {BaseRuntime} from "./BaseRuntime.js";

export class BunViteRuntime extends BaseRuntime {
  readonly name = "bun-vite";
  readonly cmd = "bun";
  readonly order: number = 1;

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
    return `bun ${args}`;
  }

  devDependencies(): Record<string, any> {
    return {
      "@tsed/cli": "{{cliVersion}}",
      typescript: "latest",
      vite: "latest"
    };
  }
}

injectable(BunViteRuntime).type("runtime");
