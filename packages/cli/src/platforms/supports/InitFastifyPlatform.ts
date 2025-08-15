import {injectable} from "@tsed/cli-core";

import type {InitBasePlatform} from "./InitBasePlatform.js";

export class InitFastifyPlatform implements InitBasePlatform {
  readonly name = "fastify";

  dependencies(ctx: any) {
    return {
      "@tsed/platform-fastify": ctx.tsedVersion,
      "@fastify/accepts": "latest",
      "@fastify/middie": "latest",
      "@fastify/static": "latest",
      "@fastify/cookie": "latest",
      "@fastify/formbody": "latest",
      "@fastify/session": "latest",
      fastify: "latest",
      "fastify-raw-body": "latest"
    };
  }

  devDependencies(ctx: any) {
    return {
      "@types/content-disposition": "latest"
    };
  }
}

injectable(InitFastifyPlatform).type("platform:init");
