// @ts-ignore
import {CliPlatformTest} from "@tsed/cli-testing";
import {injector} from "@tsed/di";

import {CliHooks} from "./CliHooks.js";

describe("CliHooks", () => {
  beforeEach(() => CliPlatformTest.create());
  afterEach(() => CliPlatformTest.reset());

  it("should execute hook handlers declared on providers", async () => {
    class TestHook {
      onTestHook(arg: string) {
        return [`${arg}-done`];
      }
    }

    const inj = injector();
    inj.addProvider(TestHook, {
      useClass: TestHook
    });
    const provider = inj.getProvider(TestHook)!;
    provider.useClass = TestHook;
    provider.store.set("$onTest", {
      cmd: ["onTestHook"]
    });

    const hooks = await CliPlatformTest.invoke<CliHooks>(CliHooks);
    const result = await hooks.emit("$onTest", "cmd", "value");

    expect(result).toEqual(["value-done"]);
  });

  it("should ignore providers that do not declare the hook/cmd combination", async () => {
    class EmptyHook {
      onOtherHook() {
        return ["noop"];
      }
    }

    const inj = injector();
    inj.addProvider(EmptyHook, {
      useClass: EmptyHook
    });
    const provider = inj.getProvider(EmptyHook)!;
    provider.useClass = EmptyHook;

    const hooks = await CliPlatformTest.invoke<CliHooks>(CliHooks);
    const result = await hooks.emit("$onUnknown", "cmd");

    expect(result).toEqual([]);
  });
});
