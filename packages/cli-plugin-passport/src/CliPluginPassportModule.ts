import {Module, OnAdd, ProjectPackageJson} from "@tsed/cli-core";
import {Inject} from "@tsed/di";
import {PassportGenerateHook} from "./hooks/PassportGenerateHook";

@Module({
  imports: [PassportGenerateHook]
})
export class CliPluginPassportModule {
  @Inject()
  packageJson: ProjectPackageJson;

  @OnAdd("@tsed/cli-plugin-passport")
  install() {
    console.log("==================================");
    this.packageJson.addDependencies({
      passport: "latest"
    });

    this.packageJson.addDevDependencies({
      "@types/passport": "latest"
    });
  }
}
