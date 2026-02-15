import {describe, expect, it} from "vitest";

import {PromptCancelledError} from "./PromptCancelledError.js";

describe("PromptCancelledError", () => {
  it("should set name and default message", () => {
    const error = new PromptCancelledError();

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("PromptCancelledError");
    expect(error.message).toBe("Prompt cancelled");
  });
});
