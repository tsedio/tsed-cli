import {execa} from "execa";

import {CliCore, Command, type CommandProvider, type Tasks} from "../../src/index.js";

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
        command: {
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
      $exec(options: any): Promise<Tasks> {
        return Promise.resolve([]);
      }
    }

    vi.spyOn(TestCommand.prototype, "$exec").mockResolvedValue([]);

    await CliCore.bootstrap({
      name: "tsed",
      commands: [TestCommand],
      argv: [require.resolve("ts-node"), "src/bin/tsed.ts", "test", "subcmd"]
    });

    expect(TestCommand.prototype.$exec).toHaveBeenCalledWith({
      bindLogger: true,
      command: "subcmd",
      rawArgs: [],
      rootDir: undefined,
      verbose: false
    });
  });
});
