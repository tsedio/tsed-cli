import {dirname, join} from "node:path";
import {fileURLToPath} from "node:url";

import readPkgUp from "read-pkg-up";

const {path, packageJson} = readPkgUp.sync({
  cwd: join(fileURLToPath(import.meta.url), "..", "..")
});
export const PKG = packageJson;
export const MINIMAL_TSED_VERSION = "7";
export const DEFAULT_TSED_TAGS = "latest";
export const IGNORE_VERSIONS = ["6.0.0"];
export const IGNORE_TAGS = false; // /alpha|beta/
export const TEMPLATE_DIR = join(dirname(path), "templates");
//# sourceMappingURL=index.js.map
