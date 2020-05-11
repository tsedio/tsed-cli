import {join} from "path";
import {findUpFile} from "./findUpFile";

export async function importModule(mod: string, root: string = process.cwd()) {
  try {
    if (process.env.NODE_ENV === "development") {
      return await import(mod);
    }
  } catch (er) {}

  const path = findUpFile(root, join("node_modules", mod));

  if (path) {
    return import(path);
  }

  return import(mod);
}
