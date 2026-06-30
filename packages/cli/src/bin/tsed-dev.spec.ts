import {describe, expect, it} from "vitest";

import {resolveEntryModulePath, shouldIgnoreWatchFile} from "./tsed-dev.js";

describe("tsed-dev", () => {
  describe("resolveEntryModulePath()", () => {
    it("should use src/index.ts by default", () => {
      expect(resolveEntryModulePath([])).toEqual("/src/index.ts");
    });

    it("should resolve a custom entry path", () => {
      expect(resolveEntryModulePath(["server/index.ts"])).toEqual("/server/index.ts");
    });

    it("should normalize a relative custom entry path", () => {
      expect(resolveEntryModulePath(["./server/index.ts"])).toEqual("/server/index.ts");
    });

    it("should ignore watch flags when resolving the custom entry path", () => {
      expect(resolveEntryModulePath(["--no-watch", "server/index.ts"])).toEqual("/server/index.ts");
      expect(resolveEntryModulePath(["--watch", "false", "server/index.ts"])).toEqual("/server/index.ts");
      expect(resolveEntryModulePath(["server/index.ts", "--watch=false"])).toEqual("/server/index.ts");
    });

    it("should keep the default entry path when only watch flags are provided", () => {
      expect(resolveEntryModulePath(["--watch=false"])).toEqual("/src/index.ts");
      expect(resolveEntryModulePath(["--watch", "true"])).toEqual("/src/index.ts");
    });
  });

  describe("shouldIgnoreWatchFile()", () => {
    it("should ignore built-in excluded paths", () => {
      expect(shouldIgnoreWatchFile(undefined)).toBe(true);
      expect(shouldIgnoreWatchFile("/project/node_modules/pkg/index.ts")).toBe(true);
      expect(shouldIgnoreWatchFile("/project/.git/HEAD")).toBe(true);
      expect(shouldIgnoreWatchFile("/project/dist/index.js")).toBe(true);
    });

    it("should ignore files rejected by the Vite watcher ignored matcher", () => {
      expect(
        shouldIgnoreWatchFile("/project/.idea/workspace.xml", {
          _isIgnored: (file: any) => file.includes("/.idea/")
        })
      ).toBe(true);
    });

    it("should keep non-ignored files watchable", () => {
      expect(
        shouldIgnoreWatchFile("/project/server/index.ts", {
          _isIgnored: (file: any) => file.includes("/.idea/")
        })
      ).toBe(false);
    });
  });
});
