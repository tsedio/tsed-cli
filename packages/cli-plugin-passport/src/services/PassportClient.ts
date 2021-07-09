import {CliHttpClient, Inject, Injectable} from "@tsed/cli-core";

const HOST = "http://www.passportjs.org/packages";

@Injectable()
export class PassportClient {
  @Inject(CliHttpClient)
  httpClient: CliHttpClient;

  async getPackages(): Promise<any[]> {
    const result = await this.httpClient.get<any>(`${HOST}/-/all.json`, {});

    return Object.values(result).filter((o: any) => {
      return o.name && o.name.startsWith("passport-");
    });
  }
}
