import {createCommandSummary} from "./createCommandSummary";

describe("createCommandSummary", () => {
  it("should return the command summary", () => {
    createCommandSummary("cmd", {
      arg1: {
        description: "test",
        required: true
      },
      arg2: {
        description: "test"
      }
    }).should.eq("cmd <arg1> [arg2]");
  });
});
