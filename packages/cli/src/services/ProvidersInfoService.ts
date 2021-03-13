import {Injectable, nameOf, Type} from "@tsed/cli-core";

export interface ProviderInfo {
  name: string;
  value: string;
  model?: string;
  baseDir?: string;
  owner?: string;
}

@Injectable()
export class ProvidersInfoService {
  readonly map: Map<string, ProviderInfo> = new Map();

  /**
   *
   * @param providerInfo
   * @param owner
   */
  add(providerInfo: ProviderInfo, owner?: Type<any>) {
    this.map.set(providerInfo.value, {
      ...providerInfo,
      owner: nameOf(owner)
    });

    return this;
  }

  get(value: string): any {
    return this.map.get(value);
  }

  isMyProvider(value: string, owner: Type<any>) {
    return this.map.get(value)?.owner === nameOf(owner);
  }

  toArray() {
    return Array.from(this.map.values());
  }

  findProviders(type: string | undefined): ProviderInfo[] {
    const providers = this.toArray();
    if (!type) {
      return providers;
    }

    type = type.toLowerCase();

    if (this.get(type)) {
      return [this.get(type)];
    }

    const proposedProviders = providers.filter((provider) => {
      return provider.name.toLowerCase().includes(type!) || provider.value.includes(type!);
    });

    return proposedProviders.length ? proposedProviders : providers;
  }
}
