import {createInjector} from "@tsed/cli-core";
import {injector} from "@tsed/di";
import {beforeEach, describe, expect, it, vi} from "vitest";

import {definePrompt, type PromptProps} from "./definePrompt.js";

describe("definePrompt", () => {
  beforeEach(() => {
    createInjector({env: "test"});
  });

  it("should define a prompt and return a token", () => {
    const handler = vi.fn().mockReturnValue({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: "Hello"
          }
        }
      ]
    });

    const token = definePrompt({
      name: "test-prompt",
      description: "Test prompt",
      handler
    });

    expect(token).toBeDefined();
    expect(typeof token).toBe("symbol");
  });

  it("should create a provider factory", () => {
    const handler = vi.fn();
    const options: PromptProps = {
      name: "test-prompt",
      description: "Test description",
      handler
    };

    const token = definePrompt(options);
    const instance = injector().invoke(token);

    expect(instance).toBeDefined();
    expect(instance.name).toBe("test-prompt");
    expect(instance.description).toBe("Test description");
  });

  it("should support custom token", () => {
    const customToken = Symbol("custom");
    const handler = vi.fn();

    const token = definePrompt({
      name: "test-prompt",
      token: customToken,
      handler
    });

    expect(token).toBe(customToken);
  });

  it("should wrap handler to execute in DI context", () => {
    const handler = vi.fn();

    const token = definePrompt({
      name: "test-prompt",
      description: "Test description",
      handler
    });

    const instance = injector().invoke(token);

    expect(typeof instance.handler).toBe("function");
    expect(instance.handler).not.toBe(handler);
  });
});
