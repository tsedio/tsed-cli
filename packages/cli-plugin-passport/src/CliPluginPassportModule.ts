import {inject, Module, OnAdd, ProjectPackageJson} from "@tsed/cli-core";
import {Inject} from "@tsed/di";

import {PassportGenerateHook} from "./hooks/PassportGenerateHook.js";

@Module({
  imports: [PassportGenerateHook]
})
export class CliPluginPassportModule {
  protected packageJson = inject(ProjectPackageJson);

  @OnAdd("@tsed/cli-plugin-passport")
  install() {
    this.packageJson.addDependencies({
      "@tsed/passport": this.packageJson.dependencies["@tsed/platform-http"],
      passport: "latest"
    });

    this.packageJson.addDevDependencies({
      "@types/passport": "latest"
    });
  }
}
