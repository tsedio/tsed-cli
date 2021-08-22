import {Module, OnAdd, ProjectPackageJson} from "@tsed/cli-core";
import {Inject} from "@tsed/di";
import {OidcProviderInitHook} from "./hooks/OidcProviderInitHook";

@Module({
  imports: [OidcProviderInitHook]
})
export class CliPluginOidcProviderModule {
  @Inject()
  packageJson: ProjectPackageJson;

  @OnAdd("@tsed/cli-plugin-oidc-provider")
  install() {
    this.packageJson.addDependencies({
      "oidc-provider": "latest",
      "@tsed/oidc-provider": "latest",
      "@tsed/jwks": "latest",
      "@tsed/adapters": "latest",
      bcrypt: "latest"
    });
  }
}
