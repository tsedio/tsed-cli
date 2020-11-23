import {Inject, Injectable} from "@tsed/di";
import axios, {AxiosRequestConfig} from "axios";
import {CliProxyAgent} from "./CliProxyAgent";

export interface CliHttpClientOptions extends AxiosRequestConfig {
  qs?: {[key: string]: any};
}

@Injectable()
export class CliHttpClient {
  @Inject()
  cliProxyAgent: CliProxyAgent;

  async $onInit() {
    await this.cliProxyAgent.resolveProxySettings();
  }

  async get(endpoint: string, options: CliHttpClientOptions = {}) {
    options = {
      params: options.params || options.qs,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(options.headers || {})
      },
      ...options
    };

    const url = new URL(endpoint);

    if (this.cliProxyAgent.hasProxy()) {
      const protocol = url.protocol.replace(":", "");
      switch (protocol) {
        case "https":
          options.httpsAgent = this.cliProxyAgent.get(protocol);
          options.proxy = false;
          break;
        case "http":
          options.httpAgent = this.cliProxyAgent.get(protocol);
          options.proxy = false;
          break;
        default:
          break;
      }
    }

    const {data} = await axios.get(endpoint, options);

    return data;
  }
}
