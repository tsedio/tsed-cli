// @ts-ignore
import {CliPlatformTest} from "@tsed/cli-testing";

import {InitCmd} from "./InitCmd.js";

describe("InitCmd", () => {
  beforeEach(() => CliPlatformTest.create());
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
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

  it("should only expose bun runtime and package manager when running with bunx", async () => {
    vi.stubGlobal("Bun", {});

    const command = await CliPlatformTest.invoke<InitCmd>(InitCmd);
    vi.spyOn((command as any).runtimes, "list").mockReturnValue(["node", "bun", "bun-vite"]);
    vi.spyOn((command as any).packageManagers, "list").mockReturnValue(["yarn", "npm", "pnpm", "bun"]);

    const prompts = await command.$prompt({
      root: "."
    });

    const runtime = prompts.find((prompt: any) => prompt.name === "runtime");
    const packageManager = prompts.find((prompt: any) => prompt.name === "packageManager");

    expect(runtime).toBeDefined();
    expect(packageManager).toBeDefined();
    expect((runtime as any).choices.map((choice: any) => choice.value)).toEqual(["bun", "bun-vite"]);
    expect((packageManager as any).choices.map((choice: any) => choice.value)).toEqual(["bun"]);
  });

  it("should force bun runtime and package manager in bunx mode", async () => {
    vi.stubGlobal("Bun", {});

    const command = await CliPlatformTest.invoke<InitCmd>(InitCmd);
    const mapped = command.$mapContext({
      root: ".",
      projectName: "project",
      features: [],
      runtime: "node",
      packageManager: "npm"
    });

    expect(mapped.runtime).toEqual("bun");
    expect(mapped.packageManager).toEqual("bun");
  });

  it("should preserve bun-vite runtime in bunx mode", async () => {
    vi.stubGlobal("Bun", {});

    const command = await CliPlatformTest.invoke<InitCmd>(InitCmd);
    const mapped = command.$mapContext({
      root: ".",
      projectName: "project",
      features: [],
      runtime: "bun-vite",
      packageManager: "npm"
    });

    expect(mapped.runtime).toEqual("bun-vite");
    expect(mapped.packageManager).toEqual("bun");
  });

  it("should write premium RC files without returning task-like results", async () => {
    const command = await CliPlatformTest.invoke<InitCmd>(InitCmd);
    const createFromTemplate = vi.spyOn((command as any).project, "createFromTemplate").mockResolvedValue({rendered: true});

    const result = await (command as any).writeRcFiles({
      premium: true
    });

    expect(result).toBeUndefined();
    expect(createFromTemplate).toHaveBeenCalledTimes(2);
    expect(createFromTemplate).toHaveBeenNthCalledWith(1, ".npmrc", {premium: true});
    expect(createFromTemplate).toHaveBeenNthCalledWith(2, ".yarnrc", {premium: true});
  });
});
