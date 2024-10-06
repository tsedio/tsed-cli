import {Configuration, Inject, registerProvider} from "@tsed/di";

import {type PackageJson} from "../interfaces/PackageJson.js";

export type CliPackageJson = PackageJson;

export function CliPackageJson(): any {
  return Inject(CliPackageJson);
}

registerProvider({
  provide: CliPackageJson,
  deps: [Configuration],
  useFactory(configuration: Configuration) {
    return configuration.pkg || {};
  }
});
