import {Module, OnAdd, ProjectPackageJson} from "@tsed/cli-core";
import {Inject} from "@tsed/di";

import {PassportGenerateHook} from "./hooks/PassportGenerateHook.js";

@Module({
  imports: [PassportGenerateHook]
})
export class CliPluginPassportModule {
  @Inject()
  packageJson: ProjectPackageJson;

  @OnAdd("@tsed/cli-plugin-passport")
  install() {
    this.packageJson.addDependencies({
      "@tsed/passport": this.packageJson.dependencies["@tsed/common"],
      passport: "latest"
    });

    this.packageJson.addDevDependencies({
      "@types/passport": "latest"
    });
  }
}
