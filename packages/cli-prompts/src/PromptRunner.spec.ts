import {beforeEach, describe, expect, it, vi} from "vitest";

import {PromptRunner} from "./PromptRunner.js";

const handlerMap = vi.hoisted(() => ({
  input: vi.fn()
}));

const handlerModule = vi.hoisted(() => {
  return new Proxy(handlerMap, {
    get(target, prop) {
      return Reflect.get(target, prop);
    }
  });
});

vi.mock("./fn/index.js", () => handlerModule);

describe("PromptRunner", () => {
  beforeEach(() => {
    handlerMap.input.mockReset();
  });

  it("should execute supported prompt types and merge answers", async () => {
    handlerMap.input.mockResolvedValueOnce("fooValue").mockResolvedValueOnce("barValue");

    const runner = new PromptRunner();
    const answers = await runner.run(
      [
        {type: "input", name: "foo", message: "Foo"},
        false as any,
        {
          type: "input",
          name: "bar",
          message: () => "Bar",
          when: (current) => current.foo === "fooValue"
        }
      ],
      {initial: true}
    );

    expect(handlerMap.input).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({name: "foo", message: "Foo"}),
      expect.objectContaining({initial: true})
    );
    expect(handlerMap.input).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({name: "bar", message: "Bar"}),
      expect.objectContaining({foo: "fooValue", initial: true})
    );
    expect(answers).toEqual({
      foo: "fooValue",
      bar: "barValue"
    });
  });

  it("should throw when prompt type is unsupported", async () => {
    const runner = new PromptRunner();
    (handlerMap as any).unknown = undefined;

    await expect(runner.run([{type: "unknown" as any, name: "noop", message: "Noop"}])).rejects.toThrow("Unsupported prompt type: unknown");
  });
});
