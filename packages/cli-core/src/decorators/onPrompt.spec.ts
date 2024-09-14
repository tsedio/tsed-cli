import {Store} from "@tsed/core";

import {CommandStoreKeys} from "../domains/CommandStoreKeys";
import {OnPrompt} from "./onPrompt";

class Test {
  @OnPrompt("cmd")
  test() {}
}

describe("@OnPrompt", () => {
  it("should store metadata", () => {
    const result = Store.from(Test).get(CommandStoreKeys.PROMPT_HOOKS);

    expect(result).toEqual({
      cmd: ["test"]
    });
  });
});
