import {Command} from "@tsed/cli-core";
import {expect} from "chai";
import {getCommandMetadata} from "./getCommandMetadata";

@Command({
  name: "name",
  description: "description",
  alias: "g"
})
class TestCmd {
}

describe("getCommandMetadata", () => {
  it("should return command metadata", () => {
    expect(getCommandMetadata(TestCmd)).to.deep.eq({
      args: {},
      description: "description",
      name: "name",
      alias: "g",
      options: {}
    });
  });
});
