import {CliCore, Command, CommandProvider, Tasks} from "../../src";

describe("Command", () => {
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
      async $exec(options: any): Promise<Tasks> {
        return [];
      }
    }

    jest.spyOn(TestCommand.prototype, "$exec").mockResolvedValue([])

    await CliCore.bootstrap({
      name: "tsed",
      commands: [TestCommand],
      argv: [require.resolve("ts-node"), "src/bin/tsed.ts", "test", "subcmd"]
    })

    expect(TestCommand.prototype.$exec).toHaveBeenCalledWith({
      "command": "subcmd",
      "rawArgs": [],
      "rootDir": undefined,
      "verbose": undefined
    })
  })
})