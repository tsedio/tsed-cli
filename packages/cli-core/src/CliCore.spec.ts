import {CliCore} from "./CliCore";
import {CliService} from "./services";
import {normalizePath} from "@tsed/normalize-path";
import execa from "execa";

vi.mock("./utils/loadPlugins");
vi.mock("execa");

describe("CliCore", () => {
  beforeEach(() => {
    vi.mocked(execa as any).mockReturnValue({});
  });
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
      vi.spyOn(CliService.prototype, "parseArgs").mockResolvedValue(undefined);
    });
    afterEach(() => vi.resetAllMocks());

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
