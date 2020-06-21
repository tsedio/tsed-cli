import {Store} from "@tsed/core";
import {CommandStoreKeys} from "../domains/CommandStoreKeys";
import {OnExec} from "./onExec";

class Test {
  @OnExec("cmd")
  test() {}
}

describe("@OnExec", () => {
  it("should store metadata", () => {
    const result = Store.from(Test).get(CommandStoreKeys.EXEC_HOOKS);

    expect(result).toEqual({
      cmd: ["test"]
    });
  });
});
