import {inject, Module, OnAdd, ProjectPackageJson} from "@tsed/cli-core";

import {TypeORMGenerateHook} from "./hooks/TypeORMGenerateHook.js";
import {TypeORMInitHook} from "./hooks/TypeORMInitHook.js";

@Module({
  imports: [TypeORMInitHook, TypeORMGenerateHook]
})
export class CliPluginTypeORMModule {
  protected packageJson = inject(ProjectPackageJson);

  @OnAdd("@tsed/cli-plugin-typeorm")
  install() {
    this.packageJson.addDependencies({
      typeorm: "latest"
    });
  }
}
