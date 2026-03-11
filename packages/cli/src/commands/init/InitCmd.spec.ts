// @ts-ignore
import {CliPlatformTest} from "@tsed/cli-testing";

import {InitCmd} from "./InitCmd.js";

describe("InitCmd", () => {
  beforeEach(() => CliPlatformTest.create());
  afterEach(() => {
    vi.restoreAllMocks();
    return CliPlatformTest.reset();
  });

  it("should print a github issue report when init fails", async () => {
    const command = await CliPlatformTest.invoke<InitCmd>(InitCmd);
    const error = new Error(`File not found: ${process.cwd()}/src/Server.ts`);
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    error.stack = `Error: boom\n    at read (${process.cwd()}/src/Server.ts:12:2)`;

    command.$onFinish(
      {
        commandName: "init",
        rawArgs: ["--skipPrompt"],
        features: ["swagger", "testing"]
      },
      error
    );

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toContain("https://github.com/tsedio/tsed-cli/issues/new");
    expect(spy.mock.calls[0][0]).toContain("Copy/paste this report:");
    expect(spy.mock.calls[0][0]).toContain("- Command: `tsed init --skipPrompt`");
    expect(spy.mock.calls[0][0]).toContain("## Init Stats");
    expect(spy.mock.calls[0][0]).toContain("- features: swagger, testing");
    expect(spy.mock.calls[0][0]).toContain("- channel: cli");
    expect(spy.mock.calls[0][0]).toContain("- Message: File not found: <cwd>/src/Server.ts");
    expect(spy.mock.calls[0][0]).toContain("at read (<cwd>/src/Server.ts:12:2)");
  });

  it("should do nothing when command is not init", async () => {
    const command = await CliPlatformTest.invoke<InitCmd>(InitCmd);
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    command.$onFinish(
      {
        commandName: "generate"
      },
      new Error("Any error")
    );

    expect(spy).not.toHaveBeenCalled();
  });

  it("should do nothing when there is no error", async () => {
    const command = await CliPlatformTest.invoke<InitCmd>(InitCmd);
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    command.$onFinish({
      commandName: "init"
    });

    expect(spy).not.toHaveBeenCalled();
  });
});
