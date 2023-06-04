import {CliHttpClient, CliHttpClientOptions} from "@tsed/cli-core";
import {OnDestroy} from "@tsed/di";

export class FakeCliHttpClient extends CliHttpClient implements OnDestroy {
  static entries = new Map<string, any>();

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

  $onDestroy() {
    FakeCliHttpClient.entries.clear();
  }
}
