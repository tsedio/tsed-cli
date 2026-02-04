// @ts-ignore
import {CliPlatformTest} from "@tsed/cli-testing";
import {Observable} from "rxjs";

import {CliExeca} from "./CliExeca.js";

vi.mock("../utils/streamToObservable.js", () => {
  return {
    streamToObservable: vi.fn()
  };
});

vi.mock("split", () => ({
  default: vi.fn(() => "SPLIT_STREAM")
}));

const mockedStreamToObservable = vi.importMock<typeof import("../utils/streamToObservable.js")>("../utils/streamToObservable.js");

describe("CliExeca", () => {
  beforeEach(() => CliPlatformTest.create());
  afterEach(() => CliPlatformTest.reset());

  describe("run()", () => {
    it("should merge stdout and stderr observables and filter falsy events", async () => {
      const stdout$ = new Observable<string>((observer) => {
        observer.next("build:started");
        observer.next("");
        observer.complete();
      });
      const stderr$ = new Observable<string>((observer) => {
        observer.next("warning");
        observer.next(undefined as any);
        observer.complete();
      });

      const streamToObservable = await mockedStreamToObservable;
      vi.mocked(streamToObservable.streamToObservable).mockReturnValueOnce(stdout$).mockReturnValueOnce(stderr$);

      const service = await CliPlatformTest.invoke<CliExeca>(CliExeca);
      const stdoutPipe = vi.fn().mockReturnValue("STDOUT");
      const stderrPipe = vi.fn().mockReturnValue("STDERR");
      const cp: any = {
        stdout: {
          pipe: stdoutPipe
        },
        stderr: {
          pipe: stderrPipe
        }
      };

      (service as any).raw = vi.fn().mockReturnValue(cp) as any;

      const events: string[] = [];
      await new Promise<void>((resolve, reject) => {
        service.run("node", ["--version"], {cwd: "/repo"}).subscribe({
          next: (value) => events.push(value),
          complete: () => resolve(),
          error: (err) => reject(err)
        });
      });

      expect(events).toEqual(["build:started", "warning"]);
      expect(stdoutPipe).toHaveBeenCalled();
      expect(stderrPipe).toHaveBeenCalled();
      expect(service.raw).toHaveBeenCalledWith("node", ["--version"], {cwd: "/repo"});
      expect(streamToObservable.streamToObservable).toHaveBeenNthCalledWith(1, "STDOUT", {await: cp});
      expect(streamToObservable.streamToObservable).toHaveBeenNthCalledWith(2, "STDERR", {await: cp});
    });
  });

  describe("runSync()", () => {
    it("should delegate to rawSync", async () => {
      const service = await CliPlatformTest.invoke<CliExeca>(CliExeca);
      const result = {stdout: "done"};

      (service as any).rawSync = vi.fn().mockReturnValue(result) as any;

      expect(service.runSync("npm", ["install"], {} as any)).toEqual(result);
      expect(service.rawSync).toHaveBeenCalledWith("npm", ["install"], {});
    });
  });

  describe("getAsync()", () => {
    it("should resolve stdout from the async process", async () => {
      const service = await CliPlatformTest.invoke<CliExeca>(CliExeca);
      (service as any).raw = vi.fn().mockResolvedValue({stdout: "ok"}) as any;

      const result = await service.getAsync("npm", ["--version"]);

      expect(service.raw).toHaveBeenCalledWith("npm", ["--version"], undefined);
      expect(result).toEqual("ok");
    });
  });

  describe("get()", () => {
    it("should return stdout from the sync process", async () => {
      const service = await CliPlatformTest.invoke<CliExeca>(CliExeca);
      (service as any).rawSync = vi.fn().mockReturnValue({stdout: "1.0.0"}) as any;

      const result = service.get("npm", ["--version"]);

      expect(service.rawSync).toHaveBeenCalledWith("npm", ["--version"], undefined);
      expect(result).toEqual("1.0.0");
    });
  });
});
