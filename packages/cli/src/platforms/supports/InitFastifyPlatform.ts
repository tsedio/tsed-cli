import {injectable} from "@tsed/cli-core";
import {SyntaxKind} from "ts-morph";

import type {ProjectClient} from "../../services/ProjectClient.js";
import type {InitBasePlatform} from "./InitBasePlatform.js";

export class InitFastifyPlatform implements InitBasePlatform {
  readonly name = "fastify";

  alterProjectFiles(project: ProjectClient): void {
    const options = project.findConfiguration("server");

    if (options) {
      const plugins = [
        "@fastify/accepts",
        "@fastify/cookie",
        {
          use: "fastify-raw-body",
          options: {
            global: false,
            runFirst: true
          }
        },
        "@fastify/formbody"
      ];

      project.getPropertyAssignment(options, {
        name: "plugins",
        kind: SyntaxKind.ArrayLiteralExpression,
        initializer: JSON.stringify(plugins, null, 2)
      });
    }
  }

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
