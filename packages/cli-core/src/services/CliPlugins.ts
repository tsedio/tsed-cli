import {Constant, Inject, Injectable} from "@tsed/di";
import {NpmRegistryClient} from "./NpmRegistryClient";

function mapPlugins({package: {name, description = "", ...otherProps}}: any) {
  return {
    name: `${name} ${description}`.trim(),
    value: name,
    ...otherProps
  };
}

@Injectable()
export class CliPlugins {
  @Constant("name")
  name: string;

  @Inject(NpmRegistryClient)
  private npmRegistryClient: NpmRegistryClient;

  async searchPlugins(keyword: string = "", options: any = {}) {
    const result = await this.npmRegistryClient.search(this.getKeyword(keyword), options);

    return result
      .filter(({package: {name}}: any) => name.startsWith(`@${this.name}/cli-plugin`) || name.startsWith(`${this.name}-cli-plugin`))
      .map(mapPlugins);
  }

  protected getKeyword(keyword: string) {
    return `@${this.name}/cli-plugin-${this.cleanKeyword(keyword)}`;
  }

  protected cleanKeyword(keyword: string) {
    return keyword
      .replace(this.name, "")
      .replace("@", "")
      .replace("/", "")
      .replace("cli-plugin-", "");
  }
}
