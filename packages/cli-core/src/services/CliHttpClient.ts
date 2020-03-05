import {Injectable} from "@tsed/di";
import * as Request from "request-promise-native";

@Injectable()
export class CliHttpClient {
  get(endpoint: string, options: Request.RequestPromiseOptions = {}) {
    return Request.get({
      url: endpoint,
      json: true,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      ...options
    });
  }
}
