import {mkdir, mkdtemp, rm, writeFile} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";

// @ts-ignore
import {CliPlatformTest} from "@tsed/cli-testing";

import {CliFs} from "./CliFs.js";

describe("CliFs", () => {
  beforeEach(() => CliPlatformTest.create());
  afterEach(() => CliPlatformTest.reset());

  it("should delegate exists() to fs-extra", async () => {
    const service = await CliPlatformTest.invoke<CliFs>(CliFs);
    service.raw.existsSync = vi.fn().mockReturnValue(true);

    expect(service.exists("package.json")).toEqual(true);
    expect(service.raw.existsSync).toHaveBeenCalledWith("package.json");
  });

  it("should normalize joins using forward slashes", async () => {
    const service = await CliPlatformTest.invoke<CliFs>(CliFs);

    expect(service.join("src", "cli", "..", "core")).toBe("src/core");
  });

  it("should read and parse json files", async () => {
    const service = await CliPlatformTest.invoke<CliFs>(CliFs);
    const spy = vi.spyOn(service, "readFile").mockResolvedValueOnce('{"name":"cli"}');

    const result = await service.readJson("package.json");

    expect(spy).toHaveBeenCalledWith("package.json", undefined);
    expect(result).toEqual({name: "cli"});
  });

  it("should stringify payloads when writing json", async () => {
    const service = await CliPlatformTest.invoke<CliFs>(CliFs);
    (service as any).raw.writeFile = vi.fn().mockResolvedValue(undefined);

    await service.writeJson("package.json", {name: "cli"});

    expect(service.raw.writeFile).toHaveBeenCalledWith("package.json", JSON.stringify({name: "cli"}, null, 2), {encoding: "utf8"});
  });

  it("should locate the nearest matching file walking up the directory tree", async () => {
    const service = await CliPlatformTest.invoke<CliFs>(CliFs);
    const hits = new Set<string>(["/repo/a/file.yml", "/repo/file.yml"]);

    vi.spyOn(service, "fileExistsSync").mockImplementation((path) => hits.has(path));

    const result = service.findUpFile("/repo/a/b", "file.yml");

    expect(result).toEqual("/repo/a/file.yml");
  });

  it("should import a module discovered under node_modules by inspecting exports", async () => {
    const service = await CliPlatformTest.invoke<CliFs>(CliFs);
    const tempDir = await mkdtemp(join(tmpdir(), "cli-fs-"));
    const moduleDir = join(tempDir, "node_modules", "cli-fs-mock");
    await mkdir(moduleDir, {recursive: true});
    await writeFile(
      join(moduleDir, "package.json"),
      JSON.stringify({
        exports: {
          ".": {
            import: "./index.mjs"
          }
        }
      })
    );
    await writeFile(join(moduleDir, "index.mjs"), "export const value = 42;");
    const finder = vi.spyOn(service, "findUpFile").mockReturnValue(moduleDir);

    try {
      const mod: any = await service.importModule("cli-fs-mock", tempDir);

      expect(mod.value).toEqual(42);
    } finally {
      finder.mockRestore();
      await rm(tempDir, {recursive: true, force: true});
    }
  });
});
