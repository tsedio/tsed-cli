import readPkgUp from "read-pkg-up";
import {dirname, join} from "path";

export function getTemplateDirectory(cwd: string) {
  const {path} = readPkgUp.sync({
    cwd: join(cwd, "..", "..")
  })!;

  return join(dirname(path), "templates");
}
