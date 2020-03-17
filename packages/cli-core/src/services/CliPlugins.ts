import {Constant, Inject, Injectable, InjectorService} from "@tsed/di";
import {loadPlugins} from "../utils/loadPlugins";
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

  @Inject()
  private npmRegistryClient: NpmRegistryClient;

  @Inject()
  private injector: InjectorService;

  async searchPlugins(keyword: string = "", options: any = {}) {
    const result = await this.npmRegistryClient.search(this.getKeyword(keyword), options);

    return result
      .filter(({package: {name}}: any) => name.startsWith(`@${this.name}/cli-plugin`) || name.startsWith(`${this.name}-cli-plugin`))
      .map(mapPlugins);
  }

  async loadPlugins() {
    return loadPlugins(this.injector);
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
