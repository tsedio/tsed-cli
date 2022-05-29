import readPkgUp from "read-pkg-up";
import {dirname, join} from "path";

const {path} = readPkgUp.sync({
  cwd: __dirname
})!;

export const TEMPLATE_DIR = join(dirname(path), "templates");
