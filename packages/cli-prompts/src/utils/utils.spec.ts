import {PromptCancelledError} from "../errors/PromptCancelledError.js";
import type {PromptQuestion} from "../interfaces/PromptQuestion.js";
import {applyTransforms} from "./applyTransforms.js";
import {ensureNotCancelled} from "./ensureNotCancelled.js";
import {normalizeChoices} from "./normalizeChoices.js";
import {normalizeQuestion} from "./normalizeQuestion.js";
import {resolveListDefault} from "./resolveListDefault.js";
import {resolveMaybe} from "./resolveMaybe.js";
import {shouldAsk} from "./shouldAsk.js";

const clack = vi.hoisted(() => ({
  note: vi.fn(),
  isCancel: vi.fn().mockReturnValue(false),
  cancel: vi.fn()
}));

vi.mock("@clack/prompts", () => clack);

describe("prompt utils", () => {
  beforeEach(() => {
    clack.note.mockReset();
    clack.isCancel.mockReset().mockReturnValue(false);
    clack.cancel.mockReset();
  });

  it("applyTransforms should chain transformer and filter", async () => {
    const transformer = vi.fn().mockResolvedValue("BAR");
    const filter = vi.fn().mockResolvedValue("bar");

    const result = await applyTransforms(
      {
        type: "input",
        name: "foo",
        message: "Foo",
        transformer,
        filter
      },
      {},
      "foo"
    );

    expect(transformer).toHaveBeenCalledWith("foo", {}, {isFinal: true});
    expect(filter).toHaveBeenCalledWith("BAR", {});
    expect(result).toBe("bar");
  });

  it("ensureNotCancelled should throw PromptCancelledError when clack cancels", () => {
    clack.isCancel.mockReturnValue(true);

    expect(() => ensureNotCancelled(Symbol("cancel"))).toThrow(PromptCancelledError);
    expect(clack.cancel).toHaveBeenCalled();
  });

  it("ensureNotCancelled should return value when not cancelled", () => {
    expect(ensureNotCancelled("ok")).toBe("ok");
  });

  it("normalizeChoices should convert primitive and object choices", () => {
    const result = normalizeChoices([{name: "Foo", value: 1, short: "F"}, "bar"]);

    expect(result).toEqual([
      {label: "Foo", value: 1, hint: "F", checked: undefined},
      {label: "bar", value: "bar"}
    ]);
  });

  it("normalizeQuestion should resolve message, default, choices, and wrap source", async () => {
    const source = vi.fn().mockResolvedValue(["a"]);
    const question: PromptQuestion = {
      type: "autocomplete",
      name: "feature",
      message: vi.fn().mockResolvedValue("Pick one"),
      default: vi.fn().mockResolvedValue("b"),
      choices: [{name: "alpha", value: "a"}],
      source
    } as any;

    const answers = {previous: true};
    const normalized = await normalizeQuestion(question, answers);

    expect(normalized.message).toBe("Pick one");
    expect(normalized.default).toBe("b");
    expect(normalized.choices).toEqual([{label: "alpha", value: "a", hint: undefined, checked: undefined}]);
    await normalized.source?.({temp: "x"});
    expect(source).toHaveBeenCalledWith({temp: "x"});
  });

  it("resolveListDefault should prefer explicit defaults, then checked, then first value", () => {
    expect(
      resolveListDefault({default: 1} as any, [
        {label: "one", value: "first"},
        {label: "two", value: "second"}
      ])
    ).toBe("second");

    expect(
      resolveListDefault({default: undefined} as any, [
        {label: "one", value: "first", checked: true},
        {label: "two", value: "second"}
      ])
    ).toBe("first");

    expect(resolveListDefault({} as any, [{label: "only", value: "single"}])).toBe("single");
  });

  it("resolveMaybe should resolve thunk values", async () => {
    expect(resolveMaybe("static", {})).toBe("static");
    await expect(resolveMaybe(async () => "dynamic", {})).resolves.toBe("dynamic");
  });

  it("shouldAsk should evaluate booleans and functions", async () => {
    const when = vi.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    const question: PromptQuestion = {
      type: "input",
      name: "x",
      message: "X",
      when
    };

    expect(await shouldAsk(question, {})).toBe(false);
    expect(await shouldAsk({...question, when: true}, {})).toBe(true);
    expect(await shouldAsk({...question, when: undefined}, {})).toBe(true);
  });
});
