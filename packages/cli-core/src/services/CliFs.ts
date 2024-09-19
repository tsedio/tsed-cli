import {fileURLToPath} from "node:url";

import {Injectable} from "@tsed/di";
import {normalizePath} from "@tsed/normalize-path";
import {PathLike, WriteFileOptions} from "fs";
import Fs, {EnsureOptions} from "fs-extra";
import {join} from "path";

@Injectable()
export class CliFs {
  raw = Fs;

  exists(path: string) {
    return this.raw.existsSync(path);
  }

  join(...args: string[]) {
    return normalizePath(join(...args));
  }

  readFile(file: string | Buffer | number, encoding?: any): Promise<string> {
    return this.raw.readFile(file, encoding) as any;
  }

  readFileSync(file: string | Buffer | number, encoding?: any) {
    return this.raw.readFileSync(file, encoding) as any;
  }

  async readJson(file: string, encoding?: any) {
    const content = await this.readFile(file, encoding);

    return JSON.parse(content);
  }

  readJsonSync(file: string, encoding?: any) {
    const content = this.readFileSync(file, encoding) as any;

    return JSON.parse(content);
  }

  async writeJson(file: string | Buffer | number, data: any, options?: WriteFileOptions | string): Promise<any> {
    await this.raw.writeFile(file, JSON.stringify(data, null, 2), options || ({encoding: "utf8"} as any));
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
      const pkg = await this.readJson(join(path, "package.json"));
      const file = pkg.exports?.["."]?.import || pkg.exports?.["."]?.default || pkg.exports?.["."] || pkg.module || pkg.main;

      return import(join(path, file));
    }

    return import(mod);
  }
}
