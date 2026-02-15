import {injectable} from "@tsed/di";

import type {CommandOptions} from "../interfaces/CommandOptions.js";
import type {CommandProvider} from "../interfaces/CommandProvider.js";
import {command} from "./command.js";

vi.mock("@tsed/di", () => ({
  injectable: vi.fn()
}));

describe("command()", () => {
  const createBuilder = () =>
    ({
      type: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      factory: vi.fn().mockReturnThis()
    }) as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should register a functional command via factory", () => {
    const builder = createBuilder();
    vi.mocked(injectable).mockReturnValue(builder);

    const handler: CommandProvider["$exec"] = vi.fn();
    const prompt: CommandProvider["$prompt"] = vi.fn();
    const options: CommandOptions<any> = {
      name: "test",
      description: "description",
      handler,
      prompt
    };

    command(options);

    expect(injectable).toHaveBeenCalledWith(Symbol.for("COMMAND_test"));
    expect(builder.type).toHaveBeenCalledWith("command");
    expect(builder.set).toHaveBeenCalledWith("command", options);
    expect(builder.factory).toHaveBeenCalledTimes(1);

    const registeredFactory = builder.factory.mock.calls[0][0];
    const result = registeredFactory();

    expect(result).toMatchObject({
      ...options,
      $exec: handler,
      $prompt: prompt
    });
    expect(result.handler).toBe(handler);
  });

  it("should register a class-based command with provided token", () => {
    const builder = createBuilder();
    vi.mocked(injectable).mockReturnValue(builder);

    class TestCommand implements CommandProvider {
      $exec(): any {}
    }

    const options: CommandOptions<any> = {
      name: "test-class",
      description: "description",
      token: TestCommand
    };

    command(options);

    expect(injectable).toHaveBeenCalledWith(TestCommand);
    expect(builder.type).toHaveBeenCalledWith("command");
    expect(builder.set).toHaveBeenCalledWith("command", options);
    expect(builder.factory).not.toHaveBeenCalled();
  });
});
