import {Inject, Injectable} from "@tsed/di";
import {PackageInfo} from "../interfaces/PackageJson";
import {CliExeca} from "./CliExeca";
import {CliHttpClient} from "./CliHttpClient";

const HOST = require("registry-url")();

@Injectable()
export class NpmRegistryClient {
  @Inject(CliHttpClient)
  private httpClient: CliHttpClient;

  @Inject()
  private cli: CliExeca;

  /**
   * Search a module on npm registry
   * @param text
   * @param options
   */
  async search(text: string, options: {size?: number; from?: number; quality?: number; popularity?: number; maintenance?: number} = {}) {
    const {objects: result} = await this.httpClient.get(`${HOST}-/v1/search`, {
      qs: {
        text,
        size: 100,
        from: 0,
        quality: 0.65,
        popularity: 0.98,
        maintenance: 0.5,
        ...options
      }
    });

    return result;
  }

  async info(packageName: string): Promise<PackageInfo> {
    try {
      const result = await this.cli.getAsync("npm", ["view", packageName, "--json"]);

      return JSON.parse(result);
    } catch (er) {
      const [{package: pkg}] = await this.search(packageName);

      return {
        ...pkg,
        "dist-tags": {
          latest: pkg.version
        }
      };
    }
  }
}
