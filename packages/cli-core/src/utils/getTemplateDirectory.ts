import {dirname, join} from "path";
import readPkgUp from "read-pkg-up";

export function getTemplateDirectory(cwd: string) {
  const {path} = readPkgUp.sync({
    cwd: join(cwd, "..", "..")
  })!;

  return join(dirname(path), "templates");
}
