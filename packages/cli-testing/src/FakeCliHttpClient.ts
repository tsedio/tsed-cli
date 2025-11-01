import {CliHttpClient, type CliHttpClientOptions} from "@tsed/cli-core";

export class FakeCliHttpClient extends CliHttpClient {
  static entries = new Map<string, (endpoint: string, options: CliHttpClientOptions) => any>();

  get(endpoint: string, options: CliHttpClientOptions = {}): Promise<any> {
    const key = endpoint + ":" + JSON.stringify(options);

    if (key.includes("https://registry.")) {
      return Promise.resolve({
        "dist-tags": {
          latest: "1.0.0"
        }
      });
    }

    if (!FakeCliHttpClient.entries.has(key)) {
      process.stdout.write("Entries missing for FakeCliHttpClient: " + key + "\n");
    }

    return FakeCliHttpClient.entries.get(key)?.(endpoint, options);
  }
}
