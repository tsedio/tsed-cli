import {Injectable} from "@tsed/cli-core";

import {InitBasePlatform} from "./InitBasePlatform.js";

@Injectable({
  type: "platform:init"
})
export class InitExpressPlatform implements InitBasePlatform {
  readonly name = "express";

  dependencies(ctx: any) {
    return {
      "@tsed/platform-express": ctx.tsedVersion,
      "body-parser": "latest",
      cors: "latest",
      compression: "latest",
      "cookie-parser": "latest",
      express: "latest",
      "method-override": "latest"
    };
  }

  devDependencies(ctx: any) {
    return {
      "@types/cors": "latest",
      "@types/express": "latest",
      "@types/compression": "latest",
      "@types/cookie-parser": "latest",
      "@types/method-override": "latest"
    };
  }
}
