import querystring from "node:querystring";

import {getValue} from "@tsed/core";
import {inject, Opts} from "@tsed/di";
import {Logger} from "@tsed/logger";

import {logToCurl} from "../utils/logToCurl.js";

export interface BaseLogClientOptions {
  callee: string;
}

export class CliHttpLogClient {
  callee: string;
  protected logger = inject(Logger);

  // @ts-ignore
  constructor(@Opts options: Partial<BaseLogClientOptions> = {}) {
    this.callee = options.callee || "http";
  }

  protected onSuccess(options: Record<string, unknown>) {
    return this.logger.debug({
      ...this.formatLog(options),
      status: "OK"
    });
  }

  protected onError(error: any, options: any) {
    const origin = this.errorMapper(error);
    this.logger.warn({
      ...this.formatLog(options),
      status: "KO",
      callee_code: origin.code,
      callee_error: origin.message,
      callee_request_qs: options.params && querystring.stringify(options.params),
      callee_request_headers: options.headers,
      callee_request_body: options.data && JSON.stringify(options.data),
      callee_response_headers: origin.headers,
      callee_response_body: origin.body && JSON.stringify(origin.body),
      callee_response_request_id: origin.x_request_id,
      curl: this.logToCurl(options)
    });
  }

  protected logToCurl(options: any) {
    return logToCurl(options);
  }

  protected getStatusCodeFromError(error: any) {
    return getValue(error, "response.status", getValue(error, "response.statusCode", getValue(error, "status")));
  }

  protected getHeadersFromError(error: any) {
    return getValue(error, "response.headers", getValue(error, "headers"));
  }

  protected getResponseBodyFromError(error: any) {
    return getValue(error, "response.data", getValue(error, "data"));
  }

  protected formatLog(options: Record<string, any>) {
    const {startTime, url, method} = options;
    const {callee} = this;
    const duration = new Date().getTime() - startTime;

    return {
      callee,
      url,
      method,
      callee_qs: options.params && querystring.stringify(options.params),
      duration: isNaN(duration) ? undefined : duration
    };
  }

  protected errorMapper(error: Error) {
    const statusCode = this.getStatusCodeFromError(error);
    const headers = this.getHeadersFromError(error);
    const body = this.getResponseBodyFromError(error);

    return {
      message: error.message || statusCode,
      code: statusCode,
      headers,
      body,
      x_request_id: getValue(error, "response.headers.x-request-id", getValue(error, "headers.x-request-id"))
    };
  }
}
