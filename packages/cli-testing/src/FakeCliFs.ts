import {PathLike} from "fs";
import {EnsureOptions, WriteFileOptions} from "fs-extra";

export class FakeCliFs {
  static entries = new Map<any, string>();

  static getKeys() {
    return Array.from(FakeCliFs.entries.keys()).sort((a, b) => (a < b ? -1 : 1));
  }

  exists(path: string): boolean {
    return FakeCliFs.entries.has(path);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async readFile(file: string | Buffer | number, encoding?: any): Promise<string> {
    return FakeCliFs.entries.get(file)!;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  writeFileSync(path: PathLike | number, data: any, options?: WriteFileOptions): void {
    FakeCliFs.entries.set(path, data);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  writeFile(file: string | Buffer | number, data: any, options?: WriteFileOptions | string): void {
    FakeCliFs.entries.set(file, data);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async ensureDir(path: string, options?: EnsureOptions | number): Promise<void> {
    FakeCliFs.entries.set(path, path);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ensureDirSync(path: string, options?: EnsureOptions | number) {
    FakeCliFs.entries.set(path, path);
  }

  $onDestroy() {
    FakeCliFs.entries.clear();
  }
}
