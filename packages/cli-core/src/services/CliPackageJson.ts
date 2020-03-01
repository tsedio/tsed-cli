import {Configuration, Inject, registerProvider} from "@tsed/di";
import {IPackageJson} from "../interfaces/IPackageJson";

export interface CliPackageJson extends IPackageJson {}

export function CliPackageJson() {
  return Inject(CliPackageJson);
}

registerProvider({
  provide: CliPackageJson,
  deps: [Configuration],
  useFactory(configuration: Configuration) {
    return configuration.pkg;
  }
});
