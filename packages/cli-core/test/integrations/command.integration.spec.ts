import type {Task} from "@tsed/cli-tasks";
import {execa} from "execa";

import {CliCore, Command, type CommandProvider} from "../../src/index.js";

vi.mock("execa");

describe("Command", () => {
  beforeEach(() => {
    vi.mocked(execa).mockReturnValue({} as never);
  });
  it("should exec a command with expected parsed argument", async () => {
    @Command({
      name: "test",
      description: "Command description",
      args: {
        argument: {
          type: String,
          description: "Arg description"
        }
      },
      options: {
        "-o, --options": {
          type: String,
          description: "Option description"
        }
      }
    })
    class TestCommand implements CommandProvider {
      $exec(options: any): Promise<Task[]> {
        return Promise.resolve([]);
      }
    }

    vi.spyOn(TestCommand.prototype, "$exec").mockResolvedValue([]);

    await CliCore.bootstrap({
      name: "tsed",
      commands: [TestCommand],
      argv: [require.resolve("ts-node"), "src/bin/tsed.ts", "test", "subcmd"]
    });

    expect(TestCommand.prototype.$exec).toHaveBeenCalledWith(
      expect.objectContaining({
        commandName: "test",
        argument: "subcmd",
        rawArgs: [],
        verbose: false
      })
    );
    expect((TestCommand.prototype.$exec as any).mock.calls[0][0].logger).toBeDefined();
  });
});
