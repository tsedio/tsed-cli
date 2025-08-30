import {injectable} from "@tsed/cli-core";
import {ts} from "ts-morph";

import type {ProjectClient} from "../../services/ProjectClient.js";
import type {InitBasePlatform} from "./InitBasePlatform.js";
import SyntaxKind = ts.SyntaxKind;

export class InitExpressPlatform implements InitBasePlatform {
  readonly name = "express";

  alterProjectFiles(project: ProjectClient): void {
    const options = project.findConfiguration("server");

    if (options) {
      const middlewares = [
        "cors",
        "cookie-parser",
        "compression",
        "method-override",
        "json-parser",
        {
          use: "urlencoded-parser",
          options: {extended: true}
        }
      ];

      project.getPropertyAssignment(options, {
        name: "middlewares",
        kind: SyntaxKind.ArrayLiteralExpression,
        initializer: JSON.stringify(middlewares, null, 2)
      });
    }
  }

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

injectable(InitExpressPlatform).type("platform:init");
