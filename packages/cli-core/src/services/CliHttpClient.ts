import {stringify} from "node:querystring";
import {URL} from "node:url";

import {cleanObject} from "@tsed/core";
import {inject, injectable} from "@tsed/di";
import axios, {type AxiosRequestConfig, type Method} from "axios";

import {CliHttpLogClient} from "./CliHttpLogClient.js";
import {CliProxyAgent} from "./CliProxyAgent.js";

export interface CliHttpClientOptions extends AxiosRequestConfig, Record<string, unknown> {
  qs?: Record<string, unknown>;
  withHeaders?: boolean;
}

export class CliHttpClient extends CliHttpLogClient {
  protected cliProxyAgent = inject(CliProxyAgent);
  protected host: string;
  private proxySettingsInitialized = false;
  private proxySettingsPromise?: Promise<void>;

  static getParamsSerializer(params: any) {
    return stringify(cleanObject(params));
  }

  async head<T = Record<string, any>>(endpoint: string, options: CliHttpClientOptions = {}): Promise<T> {
    const {headers} = await axios(await this.getRequestParameters("HEAD", endpoint, options));

    return headers as any;
  }

  async get<T = unknown>(endpoint: string, options: CliHttpClientOptions = {}): Promise<T> {
    const result = await this.send(await this.getRequestParameters("GET", endpoint, options));

    return this.mapResponse(result, options);
  }

  async post<T = unknown>(endpoint: string, options: CliHttpClientOptions = {}): Promise<T> {
    const result = await this.send(await this.getRequestParameters("POST", endpoint, options));

    return this.mapResponse(result, options);
  }

  async put<T = any>(endpoint: string, options: CliHttpClientOptions = {}): Promise<T> {
    const result = await this.send(await this.getRequestParameters("PUT", endpoint, options));

    return this.mapResponse(result, options);
  }

  async patch<T = any>(endpoint: string, options: CliHttpClientOptions = {}): Promise<T> {
    const result = await this.send(await this.getRequestParameters("PATCH", endpoint, options));

    return this.mapResponse(result, options);
  }

  async delete<T = any>(endpoint: string, options: CliHttpClientOptions = {}): Promise<T> {
    const result = await this.send(await this.getRequestParameters("DELETE", endpoint, options));

    return this.mapResponse(result, options);
  }

  protected async getRequestParameters(method: Method, endpoint: string, options: CliHttpClientOptions) {
    const url = (this.host || "") + endpoint.replace(this.host || "", "");

    await this.resolveProxySettingsOnce();

    options = {
      method,
      ...options,
      url,
      params: options.params || options.qs,
      data: options.data,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(options.headers || {})
      }
    };

    await this.configureProxy(url, options);

    return options;
  }

  private async resolveProxySettingsOnce() {
    if (this.proxySettingsInitialized) {
      return;
    }

    if (!this.proxySettingsPromise) {
      this.proxySettingsPromise = this.cliProxyAgent
        .resolveProxySettings()
        .catch(() => {
          return;
        })
        .finally(() => {
          this.proxySettingsInitialized = true;
        });
    }

    await this.proxySettingsPromise;
  }

  protected async configureProxy(endpoint: string, options: CliHttpClientOptions) {
    const url = new URL(endpoint);

    if (this.cliProxyAgent.hasProxy()) {
      const protocol = url.protocol.replace(":", "");
      switch (protocol) {
        case "https":
          options.httpsAgent = await this.cliProxyAgent.get(protocol);
          options.proxy = false;
          break;
        case "http":
          options.httpAgent = await this.cliProxyAgent.get(protocol);
          options.proxy = false;
          break;
        default:
          break;
      }
    }
  }

  protected async send(options: AxiosRequestConfig) {
    const startTime = new Date().getTime();

    try {
      const response = await axios({
        paramsSerializer: CliHttpClient.getParamsSerializer,
        ...options
      });

      this.onSuccess({startTime, ...options});

      return response;
    } catch (error) {
      this.onError(error, {startTime, ...options});
      throw error;
    }
  }

  protected mapResponse(result: any, options: CliHttpClientOptions) {
    const {withHeaders} = options;

    const data = !withHeaders ? result?.data : result;

    return withHeaders ? {data, headers: result?.headers} : data;
  }
}

injectable(CliHttpClient);
