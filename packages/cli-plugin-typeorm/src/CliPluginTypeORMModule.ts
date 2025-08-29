import type {AlterPackageJson, RenderDataContext} from "@tsed/cli";
import {inject, ProjectPackageJson} from "@tsed/cli-core";
import {injectable} from "@tsed/di";

import {TypeORMGenerateHook} from "./hooks/TypeORMGenerateHook.js";
import {TypeORMInitHook} from "./hooks/TypeORMInitHook.js";

export class CliPluginTypeORMModule implements AlterPackageJson {
  protected packageJson = inject(ProjectPackageJson);

  $alterPackageJson(packageJson: ProjectPackageJson, data: RenderDataContext) {
    if (data.typeorm) {
      packageJson.addDependencies({
        typeorm: "latest"
      });
    }

    return packageJson;
  }
}

injectable(CliPluginTypeORMModule).imports([TypeORMInitHook, TypeORMGenerateHook]);
