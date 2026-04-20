import {mkdtemp, rm, writeFile} from "node:fs/promises";
import {tmpdir} from "node:os";
import path from "node:path";

import {describe, expect, it} from "vitest";

import {resolveViteBinFromPackageJsonPath} from "./tsed-build.js";

async function withTempDir(run: (cwd: string) => Promise<void>) {
  const cwd = await mkdtemp(path.join(tmpdir(), "tsed-build-"));

  try {
    await run(cwd);
  } finally {
    await rm(cwd, {recursive: true, force: true});
  }
}

describe("tsed-build", () => {
  it("should resolve vite binary from vite/package.json bin object", async () => {
    await withTempDir(async (cwd) => {
      const packageJsonPath = path.join(cwd, "package.json");
      await writeFile(packageJsonPath, JSON.stringify({bin: {vite: "bin/vite.js"}}));

      const viteBin = await resolveViteBinFromPackageJsonPath(packageJsonPath);

      expect(viteBin).toEqual(path.join(cwd, "bin/vite.js"));
    });
  });

  it("should resolve vite binary from vite/package.json string bin", async () => {
    await withTempDir(async (cwd) => {
      const packageJsonPath = path.join(cwd, "package.json");
      await writeFile(packageJsonPath, JSON.stringify({bin: "bin/vite.js"}));

      const viteBin = await resolveViteBinFromPackageJsonPath(packageJsonPath);

      expect(viteBin).toEqual(path.join(cwd, "bin/vite.js"));
    });
  });

  it("should throw when vite binary cannot be resolved", async () => {
    await withTempDir(async (cwd) => {
      const packageJsonPath = path.join(cwd, "package.json");
      await writeFile(packageJsonPath, JSON.stringify({name: "vite"}));

      await expect(resolveViteBinFromPackageJsonPath(packageJsonPath)).rejects.toThrowError(
        "Unable to resolve Vite CLI binary from vite/package.json"
      );
    });
  });
});
