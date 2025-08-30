import type {PathLike} from "node:fs";
import * as fs from "node:fs";
import {dirname, join} from "node:path";

import {errors, type FileSystemHost, matchGlobs, type RuntimeDirEntry} from "@ts-morph/common";
import {isString} from "@tsed/core";
import {type EnsureDirOptions, type WriteFileOptions} from "fs-extra";

import {normalizePath} from "./normalizePath.js";

export class FakeCliFs implements FileSystemHost {
  static files = new Map<any, string>();
  static directories = new Set<string>();

  static getKeys() {
    return normalizePath(Array.from(FakeCliFs.files.keys()).sort((a, b) => (a < b ? -1 : 1)));
  }

  // @ts-ignore
  findUpFile() {
    return null;
  }

  exists(path: string): boolean {
    path = this.normalizePath(path);

    if (path.includes("templates")) {
      return fs.existsSync(join("/", path));
    }

    return FakeCliFs.files.has(path) || FakeCliFs.files.has(path);
  }

  readFile(file: string | Buffer | number, encoding?: any): Promise<string> {
    return Promise.resolve(this.readFileSync(file, encoding as any) as any as string);
  }

  readFileSync(file: string | Buffer | number, encoding?: any): string {
    try {
      if (isString(file)) {
        if (file.includes("templates")) {
          return fs.readFileSync(join("/", file), encoding) as any as string;
        }
        if (file.match(/_partials/) || file.includes("packages/cli")) {
          return fs.readFileSync(file, encoding) as any as string;
        }
      }
    } catch (er) {}

    const standardizedFilePath = this.normalizePath(file);
    const parentDir = this.normalizePath(dirname(standardizedFilePath));
    const hasParentDir = FakeCliFs.directories.has(parentDir);

    if (!hasParentDir) {
      throw new errors.FileNotFoundError(standardizedFilePath as any);
    }

    const fileText = FakeCliFs.files.get(standardizedFilePath);

    if (fileText === undefined) {
      throw new errors.FileNotFoundError(standardizedFilePath as any);
    }

    return fileText;
  }

  async readJson(file: string | Buffer | number, encoding?: any): Promise<string> {
    const content = await this.readFile(file, encoding);

    return content ? JSON.parse(content) : {};
  }

  readJsonSync(file: string | Buffer | number, encoding?: any): Promise<string> {
    const content = this.readFileSync(file, encoding);

    return content ? JSON.parse(content) : {};
  }

  async writeJson(file: string | Buffer | number, data: any, options?: WriteFileOptions | string): Promise<any> {
    await this.writeFile(file, JSON.stringify(data, null, 2), options || ({encoding: "utf8"} as any));
  }

  writeJsonSync(file: string | Buffer | number, data: any, options?: WriteFileOptions | string) {
    this.writeFileSync(file, JSON.stringify(data, null, 2), options || ({encoding: "utf8"} as any));
  }

  writeFileSync(path: PathLike | number, data: any, options?: WriteFileOptions): void {
    path = this.normalizePath(path) as string;

    this.mkdirSync(dirname(path));

    FakeCliFs.files.set(path, data);
  }

  writeFile(file: string | Buffer | number, data: any, options?: WriteFileOptions | string) {
    this.writeFileSync(file, data, options as any);

    return Promise.resolve();
  }

  ensureDir(path: string, options?: EnsureDirOptions | number): Promise<void> {
    this.ensureDirSync(path, options);
    return Promise.resolve();
  }

  ensureDirSync(path: string, options?: EnsureDirOptions | number) {
    this.mkdirSync(this.normalizePath(path));
    FakeCliFs.files.set(this.normalizePath(path), path);
  }

  isCaseSensitive() {
    return true;
  }

  delete(path: string) {
    this.deleteSync(path);
    return Promise.resolve();
  }

  /** @inheritdoc */
  deleteSync(path: string) {
    FakeCliFs.files.delete(this.normalizePath(path));
  }

  /** @inheritdoc */
  readDirSync(dirPath: string): RuntimeDirEntry[] {
    const standardizedDirPath = this.normalizePath(dirPath);

    const dir = FakeCliFs.directories.has(standardizedDirPath);

    if (!dir) {
      throw new errors.DirectoryNotFoundError(standardizedDirPath as any);
    }

    const files = [
      ...[...FakeCliFs.directories.keys()]
        .filter((file) => this.normalizePath(file).startsWith(standardizedDirPath + "/"))
        .map((file) => ({
          name: `/${this.normalizePath(file)}`,
          isFile: false,
          isDirectory: true,
          isSymlink: false
        })),
      ...[...FakeCliFs.files.keys()]
        .filter((file) => !FakeCliFs.directories.has(this.normalizePath(file)))
        .filter((file) => {
          return (
            this.normalizePath(file).startsWith(standardizedDirPath + "/") &&
            this.normalizePath(file)
              .replace(standardizedDirPath + "/", "")
              .split("/").length == 1
          );
        })
        .map((file) => {
          return {
            name: `/${this.normalizePath(file)}`,
            isFile: true,
            isDirectory: false,
            isSymlink: false
          };
        })
    ];

    return files;
  }

  mkdir(dirPath: string) {
    this.mkdirSync(dirPath);
    return Promise.resolve();
  }

  // #writeFileSync(filePath: string, fileText: string) {
  //   // private method to avoid calling a method in the constructor that could be overwritten (virtual method)
  //   const standardizedFilePath = FileUtils.getStandardizedAbsolutePath(this, filePath);
  //   const dirPath = FileUtils.getDirPath(standardizedFilePath);
  //   this.#getOrCreateDir(dirPath).files.set(standardizedFilePath, fileText);
  // }

  mkdirSync(dirPath: string) {
    this.normalizePath(dirPath)
      .split("/")
      .reduce((currentPath: string, dirName: string) => {
        const nextPath = join(currentPath, dirName);

        FakeCliFs.directories.add(nextPath);

        return nextPath;
      }, "");
  }

  move(srcPath: string, destPath: string) {
    this.moveSync(srcPath, destPath);
    return Promise.resolve();
  }

  moveSync(srcPath: string, destPath: string) {
    const standardizedSrcPath = this.normalizePath(srcPath);
    const standardizedDestPath = this.normalizePath(destPath);

    if (this.fileExistsSync(standardizedSrcPath)) {
      const fileText = this.readFileSync(standardizedSrcPath);
      this.deleteSync(standardizedSrcPath);
      this.writeFileSync(standardizedDestPath, fileText);
    } else if (FakeCliFs.directories.has(standardizedSrcPath)) {
      const impactedDirs = [...FakeCliFs.directories.keys()].filter((dir) => {
        return dir.startsWith(standardizedSrcPath);
      });

      const impactedFiles = [...FakeCliFs.files.entries()].filter(([file]) => {
        return file.startsWith(standardizedSrcPath);
      });

      // delete all impacted dirs
      for (const dir of impactedDirs) {
        FakeCliFs.directories.delete(dir);
      }

      this.mkdirSync(standardizedDestPath);

      // delete all impacted files
      for (const [filePath, fileText] of impactedFiles) {
        FakeCliFs.files.delete(filePath);
        FakeCliFs.files.set(filePath.replace(standardizedSrcPath, standardizedDestPath), fileText);
      }
    } else {
      throw new errors.PathNotFoundError(standardizedSrcPath as any);
    }
  }

  copy(srcPath: string, destPath: string) {
    this.copySync(srcPath, destPath);
    return Promise.resolve();
  }

  copySync(srcPath: string, destPath: string) {
    const standardizedSrcPath = this.normalizePath(srcPath);
    const standardizedDestPath = this.normalizePath(destPath);

    if (this.fileExistsSync(standardizedSrcPath)) {
      this.writeFileSync(standardizedDestPath, this.readFileSync(standardizedSrcPath));
    } else if (FakeCliFs.directories.has(standardizedSrcPath)) {
      const impactedFiles = [...FakeCliFs.files.entries()].filter(([file]) => {
        return file.startsWith(standardizedSrcPath);
      });

      this.mkdirSync(standardizedDestPath);

      // delete all impacted files
      for (const [filePath, fileText] of impactedFiles) {
        FakeCliFs.files.set(filePath.replace(standardizedSrcPath, standardizedDestPath), fileText);
      }
    } else {
      throw new errors.PathNotFoundError(standardizedSrcPath as any);
    }
  }

  fileExists(filePath: string) {
    return Promise.resolve<boolean>(this.fileExistsSync(filePath));
  }

  fileExistsSync(filePath: string) {
    return this.exists(filePath);
  }

  directoryExists(dirPath: string) {
    return Promise.resolve<boolean>(this.directoryExistsSync(dirPath));
  }

  directoryExistsSync(dirPath: string): boolean {
    return FakeCliFs.directories.has(this.normalizePath(dirPath));
  }

  realpathSync(path: string) {
    return path;
  }

  getCurrentDirectory() {
    return "/";
  }

  glob(patterns: ReadonlyArray<string>): Promise<string[]> {
    try {
      return Promise.resolve(this.globSync(patterns));
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /** @inheritdoc */
  globSync(patterns: ReadonlyArray<string>): string[] {
    const allFilePaths = [...FakeCliFs.directories.keys(), ...FakeCliFs.files.keys()]
      .map((file) => {
        return "/" + this.normalizePath(file);
      })
      .sort((a: string, b: string) => a.localeCompare(b));

    return matchGlobs(allFilePaths, patterns, this.getCurrentDirectory());
  }

  private normalizePath(path: any): string {
    return (normalizePath(path) as string).replace(/^\//, "") as string;
  }
}
