import * as Fs from "fs-extra";
import {join} from "path";

export function importModule(mod: string, root: string = process.cwd()) {
  let path = join(root, "node_modules", mod);

  if (!Fs.existsSync(path)) {
    path = require.resolve(mod);
  }

  return import(path);
}
