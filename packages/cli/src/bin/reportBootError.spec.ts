import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";

import {reportBootError} from "./reportBootError.js";

describe("reportBootError()", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockResolvedValue({ok: true});
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllGlobals();
  });

  it("should report the error raised while booting the init command", async () => {
    const error = new Error(
      "Cannot find package '@ts-morph/common' imported from /home/user/.local/share/pnpm/store/transformIndexFile.js"
    );
    Object.assign(error, {code: "ERR_MODULE_NOT_FOUND"});

    await reportBootError(error, "init");

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, options] = fetchMock.mock.calls[0];
    const body = JSON.parse(options.body);

    expect(url).toEqual("https://api.tsed.dev/rest/cli/stats");
    expect(options.method).toEqual("POST");
    expect(body).toMatchObject({
      channel: "cli",
      is_success: false,
      error_name: "ERR_MODULE_NOT_FOUND",
      features: [],
      tsed_version: "unknown",
      platform: "unknown",
      convention: "unknown",
      runtime: "node"
    });
    // required and non-empty on the stats API side
    ["package_manager", "os"].forEach((key) => expect(body[key]).toEqual(expect.stringMatching(/.+/)));
    expect(body.cli_version).toEqual(expect.stringMatching(/.+/));
    expect(body.error_message).toContain("Cannot find package '@ts-morph/common'");
    expect(body.error_message).not.toContain("/home/user");
  });

  it("should wrap a non error value", async () => {
    await reportBootError("boom", "init");

    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({
      error_name: "Error",
      is_success: false
    });
  });

  it("should not report an error for another command", async () => {
    await reportBootError(new Error("boom"), "generate");

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("should not throw when the stats API is unreachable", async () => {
    fetchMock.mockRejectedValue(new Error("network"));

    await expect(reportBootError(new Error("boom"), "init")).resolves.toBeUndefined();
  });
});
