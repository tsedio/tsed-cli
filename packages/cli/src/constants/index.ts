import {dirname, join} from "path";
import readPkgUp from "read-pkg-up";
import filedirname from "filedirname";

const [, dir] = filedirname();

const {path, packageJson} = readPkgUp.sync({
  cwd: dir
})!;

export const PKG = packageJson;
export const MINIMAL_TSED_VERSION = "6";
export const DEFAULT_TSED_TAGS = "latest";
export const IGNORE_VERSIONS = ["6.0.0"];
export const IGNORE_TAGS: false | RegExp = false; // /alpha|beta/
export const TEMPLATE_DIR = join(dirname(path), "templates");
