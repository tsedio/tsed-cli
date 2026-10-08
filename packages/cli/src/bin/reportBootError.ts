import {readFile} from "node:fs/promises";
import * as os from "node:os";
import {dirname, join} from "node:path";

import {anonymizePaths} from "../services/mappers/anonymizePaths.js";

const STATS_URL = "https://api.tsed.dev/rest/cli/stats";
const TIMEOUT = 3000;
// the stats API rejects the payload when a required field is missing or empty
const UNKNOWN = "unknown";

async function getCliVersion(dir = import.meta.dirname): Promise<string> {
  try {
    const pkg = JSON.parse(await readFile(join(dir, "package.json"), "utf8"));

    if (pkg.name === "@tsed/cli") {
      return pkg.version || "";
    }
  } catch {
    // no package.json at this level
  }

  const parent = dirname(dir);

  return parent === dir ? "" : getCliVersion(parent);
}

function getPackageManager() {
  // e.g. "pnpm/11.17.0 npm/? node/v24.18.0 linux x64"
  return process.env.npm_config_user_agent?.split("/")[0] || UNKNOWN;
}

/**
 * Report an error raised while the CLI is booting, before the injector (and therefore CliStats) exists.
 *
 * This module must only depend on Node.js built-ins: it runs precisely when a dependency of the CLI cannot be loaded.
 */
export async function reportBootError(error: unknown, commandName?: string) {
  if (commandName !== "init") {
    return;
  }

  const er = error instanceof Error ? error : new Error(String(error));

  try {
    await fetch(STATS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        features: [],
        is_success: false,
        error_name: (er as NodeJS.ErrnoException).code || er.name || "",
        error_message: [anonymizePaths(er.message || ""), anonymizePaths(er.stack || "")].filter(Boolean).join(" "),
        os: os.type(),
        channel: "cli",
        cli_version: (await getCliVersion()) || UNKNOWN,
        // the project preferences are not resolved yet at this stage
        tsed_version: UNKNOWN,
        platform: UNKNOWN,
        convention: UNKNOWN,
        package_manager: getPackageManager(),
        runtime: process.versions.bun ? "bun" : "node"
      }),
      signal: AbortSignal.timeout(TIMEOUT)
    });
  } catch {
    // reporting must never hide the original error
  }
}
