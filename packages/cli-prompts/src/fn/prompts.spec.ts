import {normalizeChoices} from "../utils/normalizeChoices.js";
import {autocomplete} from "./autocomplete.js";
import {checkbox} from "./checkbox.js";
import {confirm} from "./confirm.js";
import {input} from "./input.js";
import {list} from "./list.js";
import {password} from "./password.js";

const clack = vi.hoisted(() => ({
  text: vi.fn(),
  select: vi.fn(),
  multiselect: vi.fn(),
  confirm: vi.fn(),
  password: vi.fn(),
  autocomplete: vi.fn(),
  note: vi.fn(),
  isCancel: vi.fn().mockReturnValue(false),
  cancel: vi.fn()
}));

vi.mock("@clack/prompts", () => clack);

describe("prompt handlers", () => {
  beforeEach(() => {
    clack.text.mockReset();
    clack.select.mockReset();
    clack.multiselect.mockReset();
    clack.confirm.mockReset();
    clack.password.mockReset();
    clack.autocomplete.mockReset();
    clack.note.mockReset();
    clack.isCancel.mockReset().mockReturnValue(false);
    clack.cancel.mockReset();
  });

  it("input should resolve responses from clack text prompt", async () => {
    clack.text.mockResolvedValue("Jane Doe");

    const result = await input({
      type: "input",
      name: "fullName",
      message: "Your name?",
      default: "John"
    });

    expect(clack.text).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Your name?",
        initialValue: "John"
      })
    );
    expect(result).toBe("Jane Doe");
  });

  it("password should mask the prompt by default", async () => {
    clack.password.mockResolvedValue("secret");

    const result = await password({
      type: "password",
      name: "token",
      message: "Token?"
    });

    expect(clack.password).toHaveBeenCalledWith(expect.objectContaining({message: "Token?"}));
    expect(result).toBe("secret");
  });

  it("confirm should pass boolean default as initialValue", async () => {
    clack.confirm.mockResolvedValue(true);

    const result = await confirm({
      type: "confirm",
      name: "proceed",
      message: "Continue?",
      default: false
    });

    expect(clack.confirm).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Continue?",
        initialValue: false
      })
    );
    expect(result).toBe(true);
  });

  it("list should render normalized choices and return selection", async () => {
    clack.select.mockResolvedValue("b");
    const choices = normalizeChoices(["a", "b"]);

    const result = await list({
      type: "list",
      name: "choice",
      message: "Pick",
      choices
    });

    expect(clack.select).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Pick",
        options: choices.map((choice) => ({label: choice.label, value: choice.value, hint: choice.hint})),
        initialValue: "a"
      })
    );
    expect(result).toBe("b");
  });

  it("checkbox should respect default values", async () => {
    clack.multiselect.mockResolvedValue(["two"]);

    const result = await checkbox({
      type: "checkbox",
      name: "features",
      message: "Select",
      choices: [
        {label: "One", value: "one"},
        {label: "Two", value: "two", checked: true}
      ],
      default: ["two"]
    });

    expect(clack.multiselect).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Select",
        options: [
          {label: "One", value: "one", hint: undefined},
          {label: "Two", value: "two", hint: undefined}
        ],
        initialValues: ["two"]
      })
    );
    expect(result).toEqual(["two"]);
  });

  it("list should throw when no choices are provided", async () => {
    await expect(
      list({
        type: "list",
        name: "empty",
        message: "Empty",
        choices: []
      })
    ).rejects.toThrow('Question "empty" does not provide any choices');
  });

  it("autocomplete should delegate to clack autocomplete with normalized choices", async () => {
    const choices = normalizeChoices(["alpha", "beta"]);
    clack.autocomplete.mockResolvedValue("beta");

    const result = await autocomplete(
      {
        type: "autocomplete",
        name: "plugin",
        message: "Plugin?",
        choices
      },
      {}
    );

    expect(clack.autocomplete).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Plugin?",
        options: choices.map((choice) => ({
          label: choice.label,
          value: choice.value,
          hint: choice.hint
        }))
      })
    );
    expect(result).toBe("beta");
  });
});
