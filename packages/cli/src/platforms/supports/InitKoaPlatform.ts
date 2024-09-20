import {Injectable} from "@tsed/cli-core";

import type {InitBasePlatform} from "./InitBasePlatform.js";

@Injectable({
  type: "platform:init"
})
export class InitKoaPlatform implements InitBasePlatform {
  readonly name = "koa";

  dependencies(ctx: any) {
    return {
      "@tsed/platform-koa": ctx.tsedVersion,
      koa: "latest",
      "@koa/cors": "latest",
      "@koa/router": "latest",
      "koa-qs": "latest",
      "koa-bodyparser": "latest",
      "koa-override": "latest",
      "koa-compress": "latest"
    };
  }

  devDependencies(ctx: any) {
    return {
      "@types/koa": "latest",
      "@types/koa-qs": "latest",
      "@types/koa-json": "latest",
      "@types/koa-bodyparser": "latest",
      "@types/koa__router": "latest",
      "@types/koa-compress": "latest",
      "@types/koa-send": "latest",
      "@types/koa__cors": "latest"
    };
  }
}
