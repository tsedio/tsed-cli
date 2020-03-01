import {mapArgs} from "./mapArgs";

describe("mapArgs", () => {
  it("should map args", () => {
    const commander = {};

    mapArgs(
      {
        arg1: {
          type: String,
          description: "test",
          required: true
        },
        arg2: {
          type: Number,
          description: "test"
        },
        arg3: {
          type: Boolean,
          description: "test"
        },
        arg4: {
          type: Boolean,
          description: "test"
        },
        arg5: {
          type: Array,
          itemType: Number,
          description: "test"
        },
        arg6: {
          type: String,
          description: "test",
          defaultValue: "yo"
        }
      },
      ["hello", "1", "true", "false", "1,2,3", commander]
    ).should.deep.eq({
      arg1: "hello",
      arg2: 1,
      arg3: true,
      arg4: false,
      arg5: [1, 2, 3],
      arg6: "yo"
    });
  });
});
