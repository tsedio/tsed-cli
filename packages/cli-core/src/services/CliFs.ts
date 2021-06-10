import {Injectable} from "@tsed/di";
import {PathLike, WriteFileOptions} from "fs";
import * as Fs from "fs-extra";
import {EnsureOptions} from "fs-extra";
import {join} from "path";
import {normalizePath} from "@tsed/core";

@Injectable()
export class CliFs {
  raw = Fs;

  exists(path: string) {
    return this.raw.existsSync(path);
  }

  join(...args: string[]) {
    return normalizePath(join(...args));
  }

  async readFile(file: string | Buffer | number, encoding?: any): Promise<string> {
    return this.raw.readFile(file, encoding) as any;
  }

  writeFileSync(path: PathLike | number, data: any, options?: WriteFileOptions) {
    return this.raw.writeFileSync(path, data, options);
  }

  writeFile(file: string | Buffer | number, data: any, options?: WriteFileOptions | string) {
    return this.raw.writeFile(file, data, options as any);
  }

  ensureDir(path: string, options?: EnsureOptions | number) {
    return this.raw.ensureDir(path, options);
  }

  ensureDirSync(path: string, options?: EnsureOptions | number): void {
    return this.raw.ensureDirSync(path, options);
  }

  findUpFile(root: string, file: string) {
    return [join(root, file), join(root, "..", file), join(root, "..", "..", file), join(root, "..", "..", "..", file)].find((path) =>
      this.exists(path)
    );
  }

  async importModule(mod: string, root: string = process.cwd()) {
    try {
      if (process.env.NODE_ENV === "development") {
        return await import(mod);
      }
    } catch (er) {}

    const path = this.findUpFile(root, join("node_modules", mod));

    if (path) {
      return import(path);
    }

    return import(mod);
  }
}
