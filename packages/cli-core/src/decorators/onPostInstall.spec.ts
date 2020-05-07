import {Store} from "@tsed/core";
import {CommandStoreKeys} from "../domains/CommandStoreKeys";
import {OnPostInstall} from "./onPostInstall";

class Test {
  @OnPostInstall("cmd")
  test() {
  }
}

describe("@OnPostIntall", () => {
  it("should store metadata", () => {
    Store.from(Test)
      .get(CommandStoreKeys.POST_INSTALL_HOOKS)
      .should.deep.eq({
      cmd: ["test"]
    });
  });
});
