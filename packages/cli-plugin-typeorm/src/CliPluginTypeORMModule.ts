import {Module, OnAdd, ProjectPackageJson} from "@tsed/cli-core";
import {Inject} from "@tsed/di";
import {TypeORMCmd} from "./commands/TypeORMCmd";
import {TypeORMGenerateHook} from "./hooks/TypeORMGenerateHook";
import {TypeORMInitHook} from "./hooks/TypeORMInitHook";

@Module({
  imports: [TypeORMInitHook, TypeORMGenerateHook, TypeORMCmd]
})
export class CliPluginTypeORMModule {
  @Inject()
  packageJson: ProjectPackageJson;

  @OnAdd("@tsed/cli-plugin-typeorm")
  install() {
    this.packageJson.addDependencies({
      "@tsed/typeorm": this.packageJson.dependencies["@tsed/common"],
      typeorm: "latest"
    });
  }
}
