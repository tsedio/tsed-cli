import {Injectable} from "@tsed/di";
import axios, {AxiosRequestConfig} from "axios";

export interface CliHttpClientOptions extends AxiosRequestConfig {
  qs?: {[key: string]: any};
}

@Injectable()
export class CliHttpClient {
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

    const {data} = await axios.get(endpoint, options);

    return data;
  }
}
