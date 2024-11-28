import {Command} from "../decorators/index.js";
import {getCommandMetadata} from "./getCommandMetadata.js";

@Command({
  name: "name",
  description: "description",
  alias: "g"
})
class TestCmd {}

@Command({
  name: "name",
  description: "description",
  alias: "g",
  bindLogger: false
})
class TestCmd2 {}

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
      bindLogger: true,
      options: {}
    });

    expect(getCommandMetadata(TestCmd2)).toEqual({
      args: {},
      allowUnknownOption: false,
      description: "description",
      name: "name",
      alias: "g",
      disableReadUpPkg: false,
      enableFeatures: [],
      bindLogger: false,
      options: {}
    });
  });
});
