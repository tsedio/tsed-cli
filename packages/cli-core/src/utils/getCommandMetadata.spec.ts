import {Command} from "@tsed/cli-core";
import {getCommandMetadata} from "./getCommandMetadata";

@Command({
  name: "name",
  description: "description",
  alias: "g"
})
class TestCmd {}

describe("getCommandMetadata", () => {
  it("should return command metadata", () => {
    expect(getCommandMetadata(TestCmd)).toEqual({
      args: {},
      allowUnknownOption: false,
      description: "description",
      name: "name",
      alias: "g",
      disableReadUpPkg: false,
      enableFeatures: [],
      options: {}
    });
  });
});
