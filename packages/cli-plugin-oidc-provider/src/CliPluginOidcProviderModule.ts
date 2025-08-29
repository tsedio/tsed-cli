import "./templates/index.template.js";

import type {RenderDataContext} from "@tsed/cli";
import {Module, ProjectPackageJson} from "@tsed/cli-core";

import {OidcProviderInitHook} from "./hooks/OidcProviderInitHook.js";

@Module({
  imports: [OidcProviderInitHook]
})
export class CliPluginOidcProviderModule {
  $alterPackageJson(packageJson: ProjectPackageJson, data: RenderDataContext) {
    if (data.oidc) {
      packageJson.addDependencies({
        "oidc-provider": "latest",
        "@tsed/oidc-provider": "latest",
        "@tsed/jwks": "latest",
        "@tsed/adapters": "latest",
        bcrypt: "latest"
      });
      packageJson.addDevDependencies({
        "@types/oidc-provider": "latest"
      });
    }

    return packageJson;
  }
}
