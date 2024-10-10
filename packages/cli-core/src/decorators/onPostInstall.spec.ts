import {Store} from "@tsed/core";

import {CommandStoreKeys} from "../domains/CommandStoreKeys.js";
import {OnPostInstall} from "./onPostInstall.js";

class Test {
  @OnPostInstall("cmd")
  test() {}
}

describe("@OnPostIntall", () => {
  it("should store metadata", () => {
    const result = Store.from(Test).get(CommandStoreKeys.POST_INSTALL_HOOKS);

    expect(result).toEqual({
      cmd: ["test"]
    });
  });
});
