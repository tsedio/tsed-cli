import {dirname, join} from "path";
import {readPackageUpSync} from "read-pkg-up";

const {path, packageJson} = readPackageUpSync({
  cwd: join(import.meta.dirname, "..", "..")
})!;

export const PKG = packageJson;
export const MINIMAL_TSED_VERSION = "8";
export const DEFAULT_TSED_TAGS = "rc";
export const IGNORE_VERSIONS = ["6.0.0"];
export const IGNORE_TAGS: false | RegExp = false; // /alpha|beta/
export const TEMPLATE_DIR = join(dirname(path), "templates");
