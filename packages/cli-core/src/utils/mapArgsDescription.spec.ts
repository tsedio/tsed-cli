import {mapArgsDescription} from "./mapArgsDescription";

describe("mapArgsDescription", () => {
  it("should create description for each args", () => {
    mapArgsDescription({
      arg1: {
        description: "test",
        required: true
      },
      arg2: {
        description: "test"
      }
    }).should.deep.eq({
      arg1: "test",
      arg2: "test"
    });
  });
});
