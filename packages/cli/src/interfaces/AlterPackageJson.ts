import {ProjectPackageJson} from "@tsed/cli-core";

import type {RenderDataContext} from "./RenderDataContext.js";

export interface AlterPackageJson {
  $alterPackageJson(packageJson: ProjectPackageJson, data: RenderDataContext): ProjectPackageJson | Promise<ProjectPackageJson>;
}
