import {OnPrompt} from "@tsed/cli-core";
import {Store} from "@tsed/core";
import {CommandStoreKeys} from "../domains/CommandStoreKeys";

class Test {
  @OnPrompt("cmd")
  test() {}
}

describe("@OnPrompt", () => {
  it("should store metadata", () => {
    Store.from(Test)
      .get(CommandStoreKeys.PROMPT_HOOKS)
      .should.deep.eq({
        cmd: ["test"]
      });
  });
});
