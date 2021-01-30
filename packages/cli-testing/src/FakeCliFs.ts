import {PathLike} from "fs";
import {EnsureOptions, WriteFileOptions} from "fs-extra";
import {normalizePath} from "./normalizePath";

export class FakeCliFs {
  static entries = new Map<any, string>();

  static getKeys() {
    return normalizePath(Array.from(FakeCliFs.entries.keys()).sort((a, b) => (a < b ? -1 : 1)));
  }

  exists(path: string): boolean {
    return FakeCliFs.entries.has(normalizePath(path));
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async readFile(file: string | Buffer | number, encoding?: any): Promise<string> {
    return FakeCliFs.entries.get(normalizePath(file))!;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  writeFileSync(path: PathLike | number, data: any, options?: WriteFileOptions): void {
    FakeCliFs.entries.set(normalizePath(path), data);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  writeFile(file: string | Buffer | number, data: any, options?: WriteFileOptions | string): void {
    FakeCliFs.entries.set(normalizePath(file), data);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async ensureDir(path: string, options?: EnsureOptions | number): Promise<void> {
    FakeCliFs.entries.set(normalizePath(path), path);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ensureDirSync(path: string, options?: EnsureOptions | number) {
    FakeCliFs.entries.set(normalizePath(path), path);
  }

  $onDestroy() {
    FakeCliFs.entries.clear();
  }
}
