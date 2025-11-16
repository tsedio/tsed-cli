import {createInjector} from "@tsed/cli-core";
import {DITest, injector} from "@tsed/di";
import {s} from "@tsed/schema";
import {beforeEach, describe, expect, it, vi} from "vitest";

import {defineTool, type ToolProps} from "./defineTool.js";

describe("defineTool", () => {
  beforeEach(() => DITest.create({env: "test"}));
  afterEach(() => DITest.reset());

  it("should define a tool and return a token", () => {
    const handler = vi.fn().mockResolvedValue({
      content: [
        {
          type: "text",
          text: "Result"
        }
      ]
    });

    const token = defineTool({
      name: "test-tool",
      description: "Test tool",
      handler
    });

    expect(token).toBeDefined();
    expect(typeof token).toBe("symbol");
  });

  it("should create a provider factory", () => {
    const handler = vi.fn();
    const options: ToolProps<any, any> = {
      name: "test-tool",
      description: "Test description",
      handler
    };

    const token = defineTool(options);
    const instance = injector().invoke(token);

    expect(instance).toBeDefined();
    expect(instance.name).toBe("test-tool");
    expect(instance.description).toBe("Test description");
  });

  it("should wrap handler with DI context", async () => {
    const handler = vi.fn().mockResolvedValue({
      content: [
        {
          type: "text",
          text: "Success"
        }
      ]
    });

    const token = defineTool({
      name: "test-tool",
      description: "Test tool",
      handler
    });

    const instance = injector().invoke(token);

    expect(instance).toBeDefined();
    expect(instance.handler).toBeDefined();

    const extra = {} as any;
    const result = await instance.handler({param: "value"}, extra);

    expect(result.content[0].text).toBe("Success");
  });

  it("should handle JsonSchema inputSchema", () => {
    const handler = vi.fn();
    const inputSchema = s.object({
      param1: s.string().required()
    });

    const token = defineTool({
      name: "test-tool",
      description: "Test tool",
      inputSchema,
      handler
    });

    const instance = injector().invoke(token);

    expect(instance.name).toBe("test-tool");
  });

  it("should handle JsonSchema outputSchema", () => {
    const handler = vi.fn();
    const outputSchema = s.object({
      result: s.string().required()
    });

    const token = defineTool({
      name: "test-tool",
      description: "Test tool",
      outputSchema,
      handler
    });

    const instance = injector().invoke(token);

    expect(instance.name).toBe("test-tool");
  });

  it("should support custom token", () => {
    const customToken = Symbol("custom");
    const handler = vi.fn();

    const token = defineTool({
      name: "test-tool",
      token: customToken,
      handler
    });

    expect(token).toBe(customToken);
  });

  it("should execute handler within DI context", async () => {
    const handler = vi.fn().mockResolvedValue({
      content: []
    });

    const token = defineTool({
      name: "test-tool",
      description: "Test tool",
      handler
    });

    const instance = injector().invoke(token);
    const result = await instance.handler({}, {} as any);

    expect(result).toEqual({content: []});
  });

  it("should wrap handler to execute in DI context", () => {
    const handler = vi.fn();

    const token = defineTool({
      name: "test-tool",
      description: "Test description",
      handler
    });

    const instance = injector().invoke(token);

    expect(typeof instance.handler).toBe("function");
    expect(instance.handler).not.toBe(handler);
  });

  it("should pass through native schemas", () => {
    const handler = vi.fn();
    const nativeSchema = {
      type: "object",
      properties: {
        param: {type: "string"}
      }
    };

    const token = defineTool({
      name: "test-tool",
      description: "Test tool",
      inputSchema: nativeSchema as any,
      handler
    });

    const instance = injector().invoke(token);

    expect(instance.name).toBe("test-tool");
  });
});
