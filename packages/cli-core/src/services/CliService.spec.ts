// @ts-ignore
import {CliPlatformTest} from "@tsed/cli-testing";
import {Store} from "@tsed/core";
import {DIContext, injector, logger} from "@tsed/di";
import {s} from "@tsed/schema";
import {Command} from "commander";

import type {CommandMetadata} from "../interfaces/CommandMetadata.js";
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

  it("should merge answers provided by the PromptRunner", async () => {
    const service = await CliPlatformTest.invoke<CliService>(CliService);
    const token = class Prompted {};
    const instance = {
      $prompt: vi.fn().mockResolvedValue([{type: "input", name: "foo", message: "Foo"}])
    };

    injector().addProvider(token, {
      useValue: instance
    });

    service["commands"].set("prompted", {token} as any);
    (service as any).promptRunner = {
      run: vi.fn().mockResolvedValue({foo: "bar"})
    };

    const $ctx = new DIContext({
      id: "ctx",
      injector: injector(),
      logger: logger(),
      level: "info",
      platform: "CLI"
    });

    const data = await service["prompt"]("prompted", {}, $ctx);

    expect(data.foo).toBe("bar");
    expect((service as any).promptRunner.run).toHaveBeenCalledWith([{type: "input", name: "foo", message: "Foo"}], {});
  });

  it("should validate command inputs via inputSchema before running lifecycle", async () => {
    const service = await CliPlatformTest.invoke<CliService>(CliService);
    const schema = s.object({
      blueprint: s.string().required(),
      feature: s.string().required(),
      count: s.number().required()
    });
    const metadata: CommandMetadata = {
      name: "generate",
      description: "Generate something",
      alias: undefined,
      getOptions() {
        return {
          args: {
            blueprint: {
              description: "Blueprint name",
              required: true,
              type: String
            }
          },
          options: {},
          allowUnknownOption: false
        };
      },
      enableFeatures: [],
      disableReadUpPkg: false,
      bindLogger: true,
      inputSchema: schema
    };

    const cmd = service.createCommand(metadata);
    const runLifecycle = vi.spyOn(service, "runLifecycle").mockResolvedValue(undefined as never);

    service.program.args = ["controller"];
    cmd.args = ["generate", "controller"];
    cmd.setOptionValue("feature", "rest");
    cmd.setOptionValue("count", "3");

    await (cmd as any)._actionHandler(["controller"]);

    expect(runLifecycle).toHaveBeenCalledTimes(1);
    const [, data, ctx] = runLifecycle.mock.calls[0];
    expect(data).toEqual(
      expect.objectContaining({
        blueprint: "controller",
        feature: "rest",
        count: 3,
        verbose: false,
        rawArgs: ["controller"]
      })
    );
    expect(ctx).toBeInstanceOf(DIContext);
  });

  it("should report validation errors and skip lifecycle when inputSchema fails", async () => {
    const service = await CliPlatformTest.invoke<CliService>(CliService);
    const schema = s.object({
      feature: s.string().required()
    });
    const metadata: CommandMetadata = {
      name: "deploy",
      description: "Deploy something",
      alias: undefined,
      getOptions() {
        return {
          args: {},
          options: {},
          allowUnknownOption: false
        };
      },
      enableFeatures: [],
      disableReadUpPkg: false,
      bindLogger: true,
      inputSchema: schema
    };
    const cmd = service.createCommand(metadata);
    const runLifecycle = vi.spyOn(service, "runLifecycle").mockResolvedValue(undefined as never);
    const log = logger();
    const errorSpy = vi.spyOn(log, "error").mockReturnValue(undefined as never);

    cmd.args = ["deploy"];
    service.program.args = [];

    expect(() => (cmd as any)._actionHandler(["missing-required"])).toThrow("Validation error");

    expect(runLifecycle).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledWith({
      event: "VALIDATION_ERROR",
      errors: expect.any(Array)
    });

    errorSpy.mockRestore();
  });
});
