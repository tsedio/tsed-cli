import {mapArgsDescription} from "./mapArgsDescription";

describe("mapArgsDescription", () => {
  it("should create description for each args", () => {
    const result = mapArgsDescription({
      arg1: {
        description: "test",
        required: true
      },
      arg2: {
        description: "test"
      }
    });
    expect(result).toEqual({
      arg1: "test",
      arg2: "test"
    });
  });
});
