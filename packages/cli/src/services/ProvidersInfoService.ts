import {nameOf, Type, Injectable} from "@tsed/cli-core";

export interface IProviderInfo {
  name: string;
  value: string;
  owner?: string;
  template?: string;
}

@Injectable()
export class ProvidersInfoService {
  readonly map: Map<string, IProviderInfo> = new Map();

  /**
   *
   * @param providerInfo
   * @param owner
   */
  add(providerInfo: IProviderInfo, owner: Type<any>) {
    this.map.set(providerInfo.value, {...providerInfo, owner: nameOf(owner)});

    return this;
  }

  get(value: string): any {
    return this.map.get(value);
  }

  isMyProvider(value: string, owner: Type<any>) {
    return this.map.get(value)!.owner === nameOf(owner);
  }

  toArray() {
    return Array.from(this.map.values());
  }
}
