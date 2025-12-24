// @ts-ignore
import {CliPlatformTest} from "@tsed/cli-testing";
import {Logger} from "@tsed/logger";

import {CliHttpLogClient} from "./CliHttpLogClient.js";

class TestCliHttpLogClient extends CliHttpLogClient {
  public override logToCurl(options: any) {
    return "curl --request";
  }

  public callOnSuccess(options: any) {
    return this.onSuccess(options);
  }

  public callOnError(error: any, options: any) {
    return this.onError(error, options);
  }

  public callFormatLog(options: any) {
    return this.formatLog(options);
  }

  public callErrorMapper(error: any) {
    return this.errorMapper(error);
  }
}

describe("CliHttpLogClient", () => {
  beforeEach(() => CliPlatformTest.create());
  afterEach(() => CliPlatformTest.reset());

  async function createClient(loggerOverrides: Partial<Logger> = {}) {
    const logger = {
      debug: vi.fn(),
      warn: vi.fn(),
      level: "info",
      ...loggerOverrides
    } as Logger;

    const client = await CliPlatformTest.invoke<TestCliHttpLogClient>(TestCliHttpLogClient, [
      {
        token: Logger,
        use: logger
      }
    ]);

    return {client, logger};
  }

  it("should log successful calls with formatted metadata", async () => {
    const {client, logger} = await createClient();
    const start = Date.now() - 10;

    client.callOnSuccess({
      startTime: start,
      url: "/health",
      method: "GET",
      params: {foo: "bar"}
    });

    expect(logger.debug).toHaveBeenCalledWith(
      expect.objectContaining({
        callee: "http",
        method: "GET",
        url: "/health",
        callee_qs: "foo=bar",
        status: "OK"
      })
    );
  });

  it("should map errors, serialize request/response metadata, and log them", async () => {
    const {client, logger} = await createClient();
    const error = {
      message: "Request failed",
      response: {
        status: 500,
        headers: {
          "x-request-id": "req-1"
        },
        data: {
          message: "boom"
        }
      }
    };

    await client.callOnError(error, {
      startTime: Date.now() - 5,
      url: "/health",
      method: "POST",
      headers: {
        accept: "application/json"
      },
      params: {filter: "all"},
      data: {payload: true}
    });

    expect(logger.warn).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "KO",
        callee_code: 500,
        callee_error: "Request failed",
        callee_response_request_id: "req-1",
        callee_request_body: JSON.stringify({payload: true}),
        callee_response_body: JSON.stringify({message: "boom"}),
        curl: "curl --request"
      })
    );
  });

  it("should compute duration and omit invalid values when startTime is missing", async () => {
    const {client} = await createClient();

    const formatted = client.callFormatLog({
      startTime: undefined,
      url: "/health",
      method: "GET"
    });

    expect(formatted).toEqual({
      callee: "http",
      method: "GET",
      url: "/health",
      callee_qs: undefined,
      duration: undefined
    });
  });

  it("should map error metadata even when message is missing", async () => {
    const {client} = await createClient();
    const mapped = client.callErrorMapper({
      response: {
        status: 429,
        headers: {"x-request-id": "req-42"},
        data: {error: "too many requests"}
      }
    });

    expect(mapped).toEqual({
      message: 429,
      code: 429,
      headers: {"x-request-id": "req-42"},
      body: {error: "too many requests"},
      x_request_id: "req-42"
    });
  });
});
