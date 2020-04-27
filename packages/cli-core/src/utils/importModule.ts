import * as Fs from "fs-extra";
import {join} from "path";

export async function importModule(mod: string, root: string = process.cwd()) {
  try {
    if (process.env.NODE_ENV === "development") {
      return await import(mod);
    }
  } catch (er) {
  }

  const path = [
    join(root, "node_modules", mod),
    join(root, "..", "node_modules", mod),
    join(root, "..", "..", "node_modules", mod),
    join(root, "..", "..", "..", "node_modules", mod)
  ].find((path) => Fs.existsSync(path));

  if (path) {
    return import(path);
  }

  return import(mod);
}
