import {Store} from "@tsed/core";

import {CommandStoreKeys} from "../domains/CommandStoreKeys.js";
import {OnAdd} from "./onAdd.js";

class Test {
  @OnAdd("@tsed/cli-plugin")
  test() {}
}

describe("@OnAdd", () => {
  it("should store metadata", () => {
    const result = Store.from(Test).get(CommandStoreKeys.ADD);
    expect(result).toEqual({
      "@tsed/cli-plugin": ["test"]
    });
  });
});
