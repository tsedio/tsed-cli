import {Store} from "@tsed/core";
import {CommandStoreKeys} from "../domains/CommandStoreKeys";
import {OnAdd} from "./onAdd";

class Test {
  @OnAdd("@tsed/cli-plugin")
  test() {}
}

describe("@OnAdd", () => {
  it("should store metadata", () => {
    Store.from(Test)
      .get(CommandStoreKeys.ADD)
      .should.deep.eq({
        "@tsed/cli-plugin": ["test"]
      });
  });
});
