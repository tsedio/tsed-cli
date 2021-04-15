import {Configuration, Inject, registerProvider} from "@tsed/di";
import {PackageJson} from "../interfaces/PackageJson";

export type CliPackageJson = PackageJson;

export function CliPackageJson() {
  return Inject(CliPackageJson);
}

registerProvider({
  provide: CliPackageJson,
  deps: [Configuration],
  useFactory(configuration: Configuration) {
    return configuration.pkg || {};
  }
});
