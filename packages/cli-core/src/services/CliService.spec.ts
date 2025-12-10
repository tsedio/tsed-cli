// @ts-ignore
import {CliPlatformTest} from "@tsed/cli-testing";
import {Store} from "@tsed/core";
import {DIContext, injector, logger} from "@tsed/di";
import {Command} from "commander";

import {CliService} from "./CliService.js";

describe("CliService", () => {
  beforeEach(() => CliPlatformTest.create());
  afterEach(() => CliPlatformTest.reset());

  it("should map command data, honor $mapContext, and toggle logger level", async () => {
    const service = await CliPlatformTest.invoke<CliService>(CliService);
    const token = class TestCommand {};
    const instance = {
      $mapContext: vi.fn().mockImplementation((payload) => {
        payload.flag = true;
        return payload;
      })
    };

    injector().addProvider(token, {
      useValue: instance
    });

    service["commands"].set("generate", {token} as any);

    const $ctx = new DIContext({
      id: "ctx",
      injector: injector(),
      logger: logger(),
      level: "info",
      platform: "CLI"
    });
    $ctx.set("command", {bindLogger: vi.fn()});

    const originalLevel = logger().level;
    try {
      const result = service["mapData"]("generate", {verbose: true, tsed: "yes"} as any, $ctx);

      expect(instance.$mapContext).toHaveBeenCalledWith(
        expect.objectContaining({
          verbose: true,
          tsed: "yes",
          commandName: "generate"
        })
      );
      expect(result).toEqual({
        verbose: true,
        tsed: "yes",
        flag: true,
        commandName: "generate",
        bindLogger: $ctx.get("command")!.bindLogger
      });
      expect(logger().level.toLowerCase()).toBe("debug");
    } finally {
      logger().level = originalLevel;
    }
  });

  it("should keep info logging level when verbose is falsy", async () => {
    const service = await CliPlatformTest.invoke<CliService>(CliService);
    const token = class OtherCommand {};
    injector().addProvider(token, {
      useValue: {}
    });
    service["commands"].set("add", {token} as any);
    const $ctx = new DIContext({
      id: "ctx",
      injector: injector(),
      logger: logger(),
      level: "info",
      platform: "CLI"
    });

    const originalLevel = logger().level;
    try {
      const result = service["mapData"]("add", {verbose: false}, $ctx);

      expect(result.verbose).toBe(false);
      expect(logger().level.toLowerCase()).toBe("info");
    } finally {
      logger().level = originalLevel;
    }
  });

  it("should build options with defaults, include root-dir/verbose, and tolerate unknown options", async () => {
    const service = await CliPlatformTest.invoke<CliService>(CliService);
    const cmd = new Command("generate");
    cmd.exitOverride();

    const built = service["buildOption"](
      cmd,
      {
        "-f, --feature <name>": {
          description: "Feature name",
          required: true,
          type: String
        },
        "--toggle": {
          description: "Enable toggle",
          type: Boolean
        }
      },
      true
    );

    expect(() =>
      built.parse(["node", "cli", "--feature", "http", "--toggle", "-r", "./repo", "--verbose", "--custom"], {from: "user"})
    ).not.toThrow();

    const opts = built.opts();
    expect(opts.feature).toBe("http");
    expect(opts.toggle).toBe(true);
    expect(opts.rootDir).toBe("./repo");
    expect(opts.verbose).toBe(true);
    expect((built as any)._allowUnknownOption).toBe(true);
  });

  it("should register command arguments with required flags and defaults", async () => {
    const service = await CliPlatformTest.invoke<CliService>(CliService);
    const cmd = new Command("generate");

    service["buildArguments"](cmd, {
      project: {
        description: "Project name",
        required: true
      },
      template: {
        description: "Template name",
        required: false,
        defaultValue: "rest"
      }
    });

    const args = (cmd as any).registeredArguments;
    expect(args[0].name()).toBe("project");
    expect(args[0].required).toBe(true);
    expect(args[1].name()).toBe("template");
    expect(args[1].required).toBe(false);
    expect(args[1].defaultValue).toBe("rest");
  });

  it("should register providers via build() and guard against duplicate command names", async () => {
    const service = await CliPlatformTest.invoke<CliService>(CliService);
    const token = class First {};
    Store.from(token).set("command", {name: "generate", description: "desc", args: {}, options: {}} as any);
    const provider: any = {
      token,
      useClass: token
    };
    const createCommand = vi.spyOn(service as any, "createCommand").mockReturnValue({} as any);

    service["build"](provider);

    expect(createCommand).toHaveBeenCalledWith(expect.objectContaining({name: "generate"}));
    expect(service["commands"].get("generate")).toBe(provider);

    const duplicateProvider: any = {
      token: class Duplicate {},
      useClass: class Duplicate {},
      command: {}
    };
    Store.from(duplicateProvider.token).set("command", {name: "generate", description: "dup"} as any);

    expect(() => service["build"](duplicateProvider)).toThrow("The generate command is already registered");
  });
});
