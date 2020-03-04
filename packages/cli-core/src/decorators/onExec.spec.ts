import {OnExec} from "@tsed/cli-core";
import {Store} from "@tsed/core";
import {CommandStoreKeys} from "../domains/CommandStoreKeys";

class Test {
  @OnExec("cmd")
  test() {}
}

describe("@OnExec", () => {
  it("should store metadata", () => {
    Store.from(Test)
      .get(CommandStoreKeys.EXEC_HOOKS)
      .should.deep.eq({
        cmd: ["test"]
      });
  });
});
