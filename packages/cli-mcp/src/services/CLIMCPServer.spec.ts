import {injector} from "@tsed/di";
import {$asyncEmit} from "@tsed/hooks";
import {beforeEach, describe, expect, it, vi} from "vitest";

import {CLIMCPServer} from "./CLIMCPServer.js";

vi.mock("@tsed/cli-core", async () => {
  const actual = await vi.importActual("@tsed/cli-core");
  return {
    ...actual,
    loadPlugins: vi.fn().mockResolvedValue(undefined)
  };
});

vi.mock("@tsed/hooks", async () => {
  const actual = await vi.importActual("@tsed/hooks");
  return {
    ...actual,
    $asyncEmit: vi.fn().mockResolvedValue(undefined)
  };
});

describe("CLIMCPServer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should have a static bootstrap method", () => {
    expect(typeof CLIMCPServer.bootstrap).toBe("function");
  });

  it("should emit lifecycle hooks", async () => {
    const emitSpy = vi.mocked($asyncEmit);

    vi.spyOn(injector(), "load").mockResolvedValue(undefined);

    try {
      await CLIMCPServer.bootstrap({name: "test"});
    } catch (e) {
      // Ignore connection errors
    }

    expect(emitSpy).toHaveBeenCalledWith("$beforeInit");
    expect(emitSpy).toHaveBeenCalledWith("$afterInit");
    expect(emitSpy).toHaveBeenCalledWith("$onReady");
  });

  it("should load injector", async () => {
    const loadSpy = vi.spyOn(injector(), "load").mockResolvedValue(undefined);

    try {
      await CLIMCPServer.bootstrap({name: "test"});
    } catch (e) {
      // Ignore connection errors
    }

    expect(loadSpy).toHaveBeenCalled();
  });
});
