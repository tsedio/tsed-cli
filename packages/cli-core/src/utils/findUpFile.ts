import * as Fs from "fs-extra";
import {join} from "path";

export function findUpFile(root: string, file: string) {
  return [join(root, file), join(root, "..", file), join(root, "..", "..", file), join(root, "..", "..", "..", file)].find(path =>
    Fs.existsSync(path)
  );
}
