import {injectable} from "@tsed/cli-core";

import type {ProjectClient} from "../../services/ProjectClient.js";
import type {InitBasePlatform} from "./InitBasePlatform.js";
import {InitExpressPlatform} from "./InitExpressPlatform.js";

// fulmine.js has the Express 5 API, so the project is the Express one with the fulmine platform on top
export class InitFulminePlatform implements InitBasePlatform {
  readonly name = "fulmine";
  protected express = new InitExpressPlatform();

  alterProjectFiles(project: ProjectClient): void {
    this.express.alterProjectFiles(project);
  }

  dependencies(ctx: any) {
    return {
      ...this.express.dependencies(ctx),
      "@tsed/platform-fulmine": ctx.tsedVersion,
      "fulmine.js": "latest"
    };
  }

  devDependencies() {
    return this.express.devDependencies();
  }
}

injectable(InitFulminePlatform).type("platform:init");
