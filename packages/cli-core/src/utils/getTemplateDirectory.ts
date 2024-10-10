import {dirname, join} from "path";
import {readPackageUpSync} from "read-pkg-up";

export function getTemplateDirectory(cwd: string) {
  const {path} = readPackageUpSync({
    cwd: join(cwd, "..", "..")
  })!;

  return join(dirname(path), "templates");
}
