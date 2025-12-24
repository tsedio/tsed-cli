import {readFile} from "node:fs/promises";
import {isAbsolute, normalize, resolve} from "node:path";

import {CliFs, PackageManager, ProjectPackageJson} from "@tsed/cli-core";
import {defineTool} from "@tsed/cli-mcp";
import {inject} from "@tsed/di";
import {s} from "@tsed/schema";

import {ProjectPreferenceSchema} from "../schema/ProjectPreferencesSchema.js";

function normalizeCwd(input: string) {
  const abs = isAbsolute(input) ? input : resolve(process.cwd(), input);
  return normalize(abs);
}

/**
 * Simplified behavior per MVP:
 * - If the provided cwd exists: set it, resolve the nearest package.json root via ProjectPackageJson, return that resolved cwd.
 * - If the provided cwd does not exist: do not create anything; return an error suggesting to confirm creation and run init-project.
 */
export const setWorkspaceTool = defineTool({
  name: "set-workspace",
  title: "Set workspace",
  description:
    "Define the workspace (current working directory) for subsequent operations. Mirrors the -r option of tsed CLI. If the path exists, returns the resolved project root (nearest package.json). If it doesn't, asks to confirm creation and use init-project.",
  inputSchema: s.object({
    cwd: s.string().required().description("Absolute or relative path to use as workspace root.")
  }),
  outputSchema: s.object({
    cwd: s.string().description("Resolved project root (nearest package.json directory or the provided path)."),
    packageJson: s.object().optional().description("Resolved package json"),
    preferences: ProjectPreferenceSchema
  }),
  async handler(args) {
    const {cwd: raw} = args as any;
    const cwd = normalizeCwd(raw);
    const fs = inject(CliFs);
    const projectPackage = inject(ProjectPackageJson);

    if (fs.exists(cwd)) {
      // Set the base CWD for the CLI services (this resolves to nearest package.json)
      projectPackage.setCWD(cwd);

      // Resolved project root
      const resolved = projectPackage.cwd;

      return {
        content: [],
        structuredContent: {
          cwd: resolved,
          pkg: projectPackage.toJSON(),
          preferences: {
            convention: projectPackage.preferences.convention,
            packageManager: projectPackage.preferences.packageManager,
            platform: projectPackage.preferences.platform,
            runtime: projectPackage.preferences.runtime
          }
        }
      };
    }

    return {
      content: [],
      isError: true,
      structuredContent: {
        cwd,
        code: "E_CWD_NOT_FOUND",
        message: `Directory '${cwd}' does not exist.`,
        suggestion:
          "Confirm you want to create this folder, then call 'init-project' with { cwd: '<path>', ... } to scaffold a new Ts.ED project."
      }
    };
  }
});
