import {CliHttpClient} from "@tsed/cli-core";
import {Inject} from "@tsed/di";

const HOST = "http://www.passportjs.org/packages";

export class PassportClient {
  @Inject(CliHttpClient)
  httpClient: CliHttpClient;

  async getPackages(): Promise<any[]> {
    const result = await this.httpClient.get(`${HOST}/-/all.json`, {});

    return Object.values(result).filter((o: any) => {
      return o.name && o.name.startsWith("passport-");
    });
  }
}
