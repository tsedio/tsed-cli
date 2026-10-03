import {EventEmitter} from "node:events";

import {describe, expect, it, vi} from "vitest";

import {waitForShutdown} from "./waitForShutdown.js";

async function isPending(promise: Promise<unknown>) {
  const pending = Symbol("pending");

  return (await Promise.race([promise, new Promise((resolve) => setTimeout(() => resolve(pending), 10))])) === pending;
}

describe("waitForShutdown", () => {
  it("should stay pending while stdin is open (stdio)", async () => {
    const stdin = new EventEmitter() as unknown as NodeJS.ReadableStream;

    expect(await isPending(waitForShutdown("stdio", stdin))).toBe(true);
  });

  it.each(["end", "close"])("should resolve when stdin emits %s (stdio)", async (event) => {
    const stdin = new EventEmitter();
    const done = vi.fn();
    const promise = waitForShutdown("stdio", stdin as unknown as NodeJS.ReadableStream).then(done);

    stdin.emit(event);
    await promise;

    expect(done).toHaveBeenCalledTimes(1);
  });

  it("should never resolve with the HTTP transport", async () => {
    const stdin = new EventEmitter();
    const promise = waitForShutdown("streamable-http", stdin as unknown as NodeJS.ReadableStream);

    stdin.emit("end");

    expect(await isPending(promise)).toBe(true);
  });
});
