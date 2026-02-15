import {CliHttpClient, inject} from "@tsed/cli-core";
import {injectable} from "@tsed/di";

const HOST = "https://www.passportjs.org/packages";

type PassportPackage = {name: string; description: string; "dist-tags": Record<string, string>};

export class PassportClient {
  protected httpClient = inject(CliHttpClient);
  private cache: PassportPackage[];

  async getPackages() {
    if (!this.cache) {
      const result = await this.httpClient.get<Record<string, PassportPackage>>(`${HOST}/-/all.json`, {});

      this.cache = Object.values(result).filter((o) => {
        return o.name?.startsWith("passport-");
      });
    }

    return this.cache;
  }

  async getPackage(name: string) {
    const packages = await this.getPackages();

    return packages.find((pkg) => pkg.name === name);
  }

  async getPackageVersion(name: string): Promise<string> {
    let pkg = await this.getPackage(name);
    return pkg?.["dist-tags"]?.latest || "latest";
  }

  async getChoices(input?: string) {
    const choices = (await this.getPackages()).map((item) => {
      return {
        name: `${item.name} - ${item.description}`,
        value: item.name
      };
    });

    if (input) {
      return choices.filter((item) => item.name.toLowerCase().includes(input.toLowerCase()));
    }

    return choices;
  }
}

injectable(PassportClient);
