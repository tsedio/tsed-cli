import readPkgUp from "read-pkg-up";
import {dirname, join} from "path";
import filedirname from "filedirname";
const [, dir] = filedirname();

const {path} = readPkgUp.sync({
  cwd: join(dir, "..", "..")
})!;

export const TEMPLATE_DIR = join(dirname(path), "templates");
