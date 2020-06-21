import {createCommandSummary} from "./createCommandSummary";

describe("createCommandSummary", () => {
  it("should return the command summary", () => {
    const result = createCommandSummary("cmd", {
      arg1: {
        description: "test",
        required: true
      },
      arg2: {
        description: "test"
      }
    });

    expect(result).toEqual("cmd <arg1> [arg2]");
  });
});
