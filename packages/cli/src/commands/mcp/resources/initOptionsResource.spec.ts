import {DITest, injector} from "@tsed/di";
import {afterEach, beforeEach, describe, expect, it} from "vitest";

import {initOptionsResource} from "./initOptionsResource.js";

describe("initOptionsResource", () => {
  beforeEach(() => DITest.create({env: "test"}));
  afterEach(() => DITest.reset());

  it("should return curated instructions plus schema metadata", async () => {
    const instance = injector().invoke(initOptionsResource);
    const result = await instance.handler(new URL("tsed://init/options"));

    expect(result.contents).toHaveLength(1);

    const payload = result.contents[0];

    expect(payload.mimeType).toBe("application/json");
    expect(payload.uri).toBe("tsed://init/options");
    expect(typeof payload.text).toBe("string");

    const parsed = JSON.parse(payload.text as string);

    expect(parsed.instructions).toMatch(/1\)/);
    expect(parsed.instructions).toContain("Choose the target Framework");
    expect(parsed.instructions).toMatch(/Express/);
    expect(parsed.instructions).toContain("LLM note only");
    expect(parsed.instructions).toMatch(/schema\.properties\.platform/);

    const schema = parsed.schema;

    expect(JSON.stringify(schema)).not.toContain('"x-opt"');
    const platform = schema?.properties?.platform;
    expect(platform?.["x-label"]).toBeDefined();
    expect(platform?.["x-choices"]).toBeInstanceOf(Array);
  });
});
