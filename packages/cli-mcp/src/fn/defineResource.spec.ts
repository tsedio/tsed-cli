import {DITest, injector} from "@tsed/di";

import {defineResource, type ResourceProps} from "./defineResource.js";

describe("defineResource", () => {
  beforeEach(() => DITest.create());
  afterEach(() => DITest.reset());

  it("should define a resource and return a token", () => {
    const handler = vi.fn().mockResolvedValue({
      contents: [
        {
          uri: "test://resource",
          text: "Resource content"
        }
      ]
    });

    const token = defineResource({
      name: "test-resource",
      uri: "test://resource",
      description: "Test resource",
      handler
    });

    expect(token).toBeDefined();
    expect(typeof token).toBe("symbol");
  });

  it("should create a provider factory", () => {
    const handler = vi.fn();
    const options: ResourceProps = {
      name: "test-resource",
      uri: "test://resource",
      description: "Test description",
      handler
    };

    const token = defineResource(options);
    const instance = injector().invoke(token);

    expect(instance).toBeDefined();
    expect(instance.name).toBe("test-resource");
    expect(instance.description).toBe("Test description");
  });

  it("should wrap handler with DI context", async () => {
    const handler = vi.fn().mockResolvedValue({
      contents: [
        {
          uri: "test://resource",
          text: "Resource data"
        }
      ]
    });

    const token = defineResource({
      name: "test-resource",
      uri: "test://resource",
      description: "Test resource",
      handler
    });

    const instance = injector().invoke(token);

    expect(instance).toBeDefined();
    expect(instance.handler).toBeDefined();

    const uri = new URL("test://resource");
    const result = await instance.handler(uri);

    expect(result.contents[0].text).toBe("Resource data");
  });

  it("should execute handler within DI context", async () => {
    const handler = vi.fn().mockResolvedValue({
      contents: []
    });

    const token = defineResource({
      name: "test-resource",
      uri: "test://resource",
      description: "Test resource",
      handler
    });

    const instance = injector().invoke(token);
    const result = await instance.handler(new URL("test://resource"));

    expect(result).toEqual({
      contents: []
    });
  });

  it("should wrap handler to execute in DI context", () => {
    const handler = vi.fn();

    const token = defineResource({
      name: "test-resource",
      uri: "test://resource",
      description: "Test description",
      mimeType: "text/plain",
      handler
    });

    const instance = injector().invoke(token);

    expect(typeof instance.handler).toBe("function");
    expect(instance.handler).toBe(handler);
  });

  it("should support resource templates", () => {
    const handler = vi.fn().mockResolvedValue({
      contents: []
    });

    const token = defineResource({
      name: "test-template",
      uri: "test://template/{id}",
      description: "Template resource",
      handler
    });

    const instance = injector().invoke(token);

    expect(instance.uri).toBe("test://template/{id}");
  });

  it("should pass all arguments to handler", async () => {
    const handler = vi.fn().mockResolvedValue({
      contents: [
        {
          uri: "test://resource",
          text: "Data"
        }
      ]
    });

    const token = defineResource({
      name: "test-resource",
      uri: "test://resource",
      handler
    });

    const instance = injector().invoke(token);
    const uri = new URL("test://resource");

    const result = await instance.handler(uri);

    expect(result.contents[0].text).toBe("Data");
  });
});
