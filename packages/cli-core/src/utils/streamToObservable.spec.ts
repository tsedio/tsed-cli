import {PassThrough} from "node:stream";

import {lastValueFrom} from "rxjs";

import {streamToObservable} from "./streamToObservable.js";

describe("streamToObservable", () => {
  it("should emit data and complete when the awaited promise resolves", async () => {
    const stream = new PassThrough({objectMode: true});
    const observable = streamToObservable(stream, {await: Promise.resolve()});
    const values: string[] = [];

    const promise = new Promise<void>((resolve, reject) => {
      observable.subscribe({next: (v) => values.push(v), complete: resolve, error: reject});
    });

    stream.write("line");
    stream.end();

    await promise;

    expect(values).toEqual(["line"]);
  });

  it("should error without leaving an unhandled rejection when the awaited promise rejects after the stream ended", async () => {
    const unhandled = vi.fn();
    process.on("unhandledRejection", unhandled);

    try {
      const stream = new PassThrough({objectMode: true});
      let rejectProcess!: (err: Error) => void;
      const awaited = new Promise((_, reject) => {
        rejectProcess = reject;
      });

      const observable = streamToObservable(stream, {await: awaited});
      const result = lastValueFrom(observable, {defaultValue: undefined});

      stream.end();
      await new Promise((resolve) => setImmediate(resolve));

      rejectProcess(new Error("Command failed with exit code 1: pnpm install"));

      await expect(result).rejects.toThrow("Command failed with exit code 1: pnpm install");

      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(unhandled).not.toHaveBeenCalled();
    } finally {
      process.off("unhandledRejection", unhandled);
    }
  });
});
