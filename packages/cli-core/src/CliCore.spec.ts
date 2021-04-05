import {CliCore} from "./CliCore";
import {normalizePath} from "@tsed/core";
import {CliService} from "./services";

jest.mock("./utils/loadPlugins");

describe("CliCore", () => {
  describe("getProjectRoot()", () => {
    it("should return project root (-r)", () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const root = CliCore.getProjectRoot(["tsed", "do", "-r", "/path/to/root"]);

      expect(normalizePath(root)).toEqual(normalizePath(process.cwd(), "path/to/root"));
    });
    it("should return project root (--root-dir)", () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const root = CliCore.getProjectRoot(["tsed", "do", "--root-dir", "/path/to/root"]);

      expect(normalizePath(root)).toEqual(normalizePath(process.cwd(), "path/to/root"));
    });
    it("should return project root (-h)", () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const root = CliCore.getProjectRoot(["tsed", "do", "-h"]);

      expect(normalizePath(root)).toEqual(normalizePath(process.cwd()));
    });
    it("should return project root (--help)", () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const root = CliCore.getProjectRoot(["tsed", "do", "--help"]);

      expect(normalizePath(root)).toEqual(normalizePath(process.cwd()));
    });
  });

  describe("bootstrap()", () => {
    beforeEach(() => {
      jest.spyOn(CliService.prototype, "parseArgs").mockResolvedValue(undefined);
    });
    afterEach(() => jest.resetAllMocks());

    it("should bootstrap CLI with process.argv", async () => {
      await CliCore.bootstrap({});

      expect(CliService.prototype.parseArgs).toHaveBeenCalledWith(process.argv);
    });

    it("should bootstrap CLI custom args", async () => {
      await CliCore.bootstrap({
        argv: ["tsed", "do", "-s"]
      });

      expect(CliService.prototype.parseArgs).toHaveBeenCalledWith(["tsed", "do", "-s"]);
    });
  });
});
