import {CliHttpClient, inject, Injectable} from "@tsed/cli-core";

const HOST = "http://www.passportjs.org/packages";

@Injectable()
export class PassportClient {
  protected httpClient = inject(CliHttpClient);

  async getPackages(): Promise<any[]> {
    const result = await this.httpClient.get<any>(`${HOST}/-/all.json`, {});

    return Object.values(result).filter((o: any) => {
      return o.name && o.name.startsWith("passport-");
    });
  }
}
