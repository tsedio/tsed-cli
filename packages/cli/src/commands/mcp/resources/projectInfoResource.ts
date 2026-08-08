import {ProjectPackageJson} from "@tsed/cli-core";
import {inject} from "@tsed/di";
import {defineResource} from "@tsed/platform-mcp/cli";

export const projectInfoResource = defineResource({
  name: "project-info",
  uri: "tsed://project/info",
  title: "Inspect project information",
  description: "Read project information like cwd, package.json, preferences and if it's an initialised Ts.ED",
  mimeType: "application/json",
  async handler(uri) {
    const projectPackage = inject(ProjectPackageJson);

    const info = {
      cwd: projectPackage.cwd,
      pkg: projectPackage.toJSON(),
      isInitialized: !!projectPackage.preferences?.packageManager,
      preferences: {
        convention: projectPackage.preferences.convention,
        packageManager: projectPackage.preferences.packageManager,
        platform: projectPackage.preferences.platform,
        runtime: projectPackage.preferences.runtime
      }
    };

    return {
      contents: [
        {
          uri: uri.href,
          mimeType: "application/json",
          text: JSON.stringify(info, null, 2)
        }
      ]
    };
  }
});
