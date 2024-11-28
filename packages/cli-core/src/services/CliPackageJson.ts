import {Configuration, Inject, inject, registerProvider} from "@tsed/di";

import {type PackageJson} from "../interfaces/PackageJson.js";

export type CliPackageJson = PackageJson;

export function CliPackageJson(): any {
  return Inject(CliPackageJson);
}

export function cliPackageJson() {
  return inject<PackageJson>(CliPackageJson);
}

registerProvider({
  provide: CliPackageJson,
  deps: [Configuration],
  useFactory(configuration: Configuration) {
    return configuration.get("pkg", {});
  }
});
