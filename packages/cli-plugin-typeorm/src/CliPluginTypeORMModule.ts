import {Module, OnAdd, ProjectPackageJson} from "@tsed/cli-core";
import {Inject} from "@tsed/di";

import {TypeORMGenerateHook} from "./hooks/TypeORMGenerateHook.js";
import {TypeORMInitHook} from "./hooks/TypeORMInitHook.js";

@Module({
  imports: [TypeORMInitHook, TypeORMGenerateHook]
})
export class CliPluginTypeORMModule {
  @Inject()
  packageJson: ProjectPackageJson;

  @OnAdd("@tsed/cli-plugin-typeorm")
  install() {
    this.packageJson.addDependencies({
      typeorm: "latest"
    });
  }
}
