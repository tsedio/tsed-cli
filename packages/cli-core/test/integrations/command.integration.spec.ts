import {CliCore, Command, CommandProvider, Tasks} from "../../src";
import execa from "execa";

vi.mock("execa")

describe("Command", () => {
  beforeEach(() => {
    (execa as any as vi.Mock).mockReturnValue({})
  })
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

    vi.spyOn(TestCommand.prototype, "$exec").mockResolvedValue([])

    await CliCore.bootstrap({
      name: "tsed",
      commands: [TestCommand],
      argv: [require.resolve("ts-node"), "src/bin/tsed.ts", "test", "subcmd"]
    })

    expect(TestCommand.prototype.$exec).toHaveBeenCalledWith({
      "bindLogger": true,
      "command": "subcmd",
      "rawArgs": [],
      "rootDir": undefined,
      "verbose": false
    })
  })
})
