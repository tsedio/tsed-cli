import {normalizeChoices} from "../utils/normalizeChoices.js";
import {autocomplete} from "./autocomplete.js";
import {checkbox} from "./checkbox.js";
import {confirm} from "./confirm.js";
import {input} from "./input.js";
import {list} from "./list.js";
import {password} from "./password.js";

const SEARCH_ACTION = "__tsed_cli_search_again__";

const clack = vi.hoisted(() => ({
  text: vi.fn(),
  select: vi.fn(),
  multiselect: vi.fn(),
  confirm: vi.fn(),
  password: vi.fn(),
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
    clack.note.mockReset();
    clack.isCancel.mockReset().mockReturnValue(false);
    clack.cancel.mockReset();
  });

  it("input should resolve responses from clack text prompt", async () => {
    clack.text.mockResolvedValue("Jane Doe");

    const result = await input(
      {
        type: "input",
        name: "fullName",
        message: "Your name?",
        default: "John"
      },
      {}
    );

    expect(clack.text).toHaveBeenCalledWith({message: "Your name?", initialValue: "John"});
    expect(result).toBe("Jane Doe");
  });

  it("password should mask the prompt by default", async () => {
    clack.password.mockResolvedValue("secret");

    const result = await password(
      {
        type: "password",
        name: "token",
        message: "Token?"
      },
      {}
    );

    expect(clack.password).toHaveBeenCalledWith({message: "Token?", mask: "•"});
    expect(result).toBe("secret");
  });

  it("confirm should pass boolean default as initialValue", async () => {
    clack.confirm.mockResolvedValue(true);

    const result = await confirm(
      {
        type: "confirm",
        name: "proceed",
        message: "Continue?",
        default: false
      },
      {}
    );

    expect(clack.confirm).toHaveBeenCalledWith({message: "Continue?", initialValue: false});
    expect(result).toBe(true);
  });

  it("list should render normalized choices and return selection", async () => {
    clack.select.mockResolvedValue("b");
    const choices = normalizeChoices(["a", "b"]);

    const result = await list(
      {
        type: "list",
        name: "choice",
        message: "Pick",
        choices
      },
      {}
    );

    expect(clack.select).toHaveBeenCalledWith({
      message: "Pick",
      options: choices.map((choice) => ({label: choice.label, value: choice.value, hint: choice.hint})),
      initialValue: "a",
      maxItems: undefined
    });
    expect(result).toBe("b");
  });

  it("checkbox should respect default values", async () => {
    clack.multiselect.mockResolvedValue(["two"]);

    const result = await checkbox(
      {
        type: "checkbox",
        name: "features",
        message: "Select",
        choices: [
          {label: "One", value: "one"},
          {label: "Two", value: "two", checked: true}
        ],
        default: ["two"]
      },
      {}
    );

    expect(clack.multiselect).toHaveBeenCalledWith({
      message: "Select",
      options: [
        {label: "One", value: "one", hint: undefined},
        {label: "Two", value: "two", hint: undefined}
      ],
      initialValues: ["two"]
    });
    expect(result).toEqual(["two"]);
  });

  it("list should throw when no choices are provided", async () => {
    await expect(
      list(
        {
          type: "list",
          name: "empty",
          message: "Empty",
          choices: []
        },
        {}
      )
    ).rejects.toThrow('Question "empty" does not provide any choices');
  });

  it("autocomplete should support search flow and selection", async () => {
    clack.select.mockResolvedValueOnce(SEARCH_ACTION).mockResolvedValueOnce("beta");
    clack.text.mockResolvedValueOnce("b");

    const result = await autocomplete(
      {
        type: "autocomplete",
        name: "plugin",
        message: "Plugin?",
        pageSize: 5,
        source: (answers, keyword = "") => {
          expect(answers).toHaveProperty("prefilled", true);
          return Promise.resolve(["alpha", "beta"].filter((entry) => entry.includes(keyword)));
        }
      },
      {prefilled: true}
    );

    expect(clack.text).toHaveBeenCalledWith({
      message: "Plugin? (no matches, type to search)",
      initialValue: ""
    });
    expect(result).toBe("beta");
  });
});
