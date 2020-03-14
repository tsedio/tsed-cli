import {Constant, Injectable} from "@tsed/di";
import {CliHttpClient} from "../services/CliHttpClient";

const HOST = require("registry-url")();

@Injectable()
export class CliPlugins {
  @Constant("name")
  name: string;

  constructor(private httpClient: CliHttpClient) {}

  async searchPlugins(keyword: string = "", options: any = {}) {
    keyword = keyword
      .replace(this.name, "")
      .replace("@", "")
      .replace("/", "")
      .replace("cli-plugin-", "");

    const {objects: result} = await this.httpClient.get(`${HOST}-/v1/search`, {
      qs: {
        text: `@${this.name}/cli-plugin-${keyword}`,
        size: 100,
        from: 0,
        quality: 0.65,
        popularity: 0.98,
        maintenance: 0.5,
        ...options
      }
    });

    return result
      .filter(({package: {name}}: any) => name.startsWith(`@${this.name}/cli-plugin`) || name.startsWith(`${this.name}-cli-plugin`))
      .map(({package: {name, description = "", ...otherProps}}: any) => {
        return {
          name: `${name} ${description}`,
          value: name,
          ...otherProps
        };
      });
  }
}
