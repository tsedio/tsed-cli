import {readFile} from "node:fs/promises";
import {isAbsolute, normalize, resolve} from "node:path";

import {ProjectPackageJson} from "@tsed/cli-core";
import {defineResource, defineTool} from "@tsed/cli-mcp";
import {constant, inject} from "@tsed/di";
import {array, object, s, string} from "@tsed/schema";

import {ProjectPreferenceSchema} from "../schema/ProjectPreferencesSchema.js";

function resolveCwd(cwd?: string) {
  const projectPackage = inject(ProjectPackageJson);
  const base = cwd || projectPackage.cwd || process.cwd();
  const abs = isAbsolute(base) ? base : resolve(process.cwd(), base);
  return normalize(abs);
}

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
