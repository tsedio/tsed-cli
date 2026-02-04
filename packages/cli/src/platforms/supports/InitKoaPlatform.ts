import {injectable} from "@tsed/cli-core";
import {SyntaxKind} from "ts-morph";

import type {ProjectClient} from "../../services/ProjectClient.js";
import type {InitBasePlatform} from "./InitBasePlatform.js";

export class InitKoaPlatform implements InitBasePlatform {
  readonly name = "koa";

  alterProjectFiles(project: ProjectClient): void {
    const options = project.findConfiguration("server");

    if (options) {
      const middlewares = ["@koa/cors", "koa-compress", "koa-override", "koa-bodyparser"];

      project.getPropertyAssignment(options, {
        name: "middlewares",
        kind: SyntaxKind.ArrayLiteralExpression,
        initializer: JSON.stringify(middlewares, null, 2)
      });
    }
  }

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

injectable(InitKoaPlatform).type("platform:init");
