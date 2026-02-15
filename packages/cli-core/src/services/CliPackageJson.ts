import {constant, Inject, inject, injectable} from "@tsed/di";

import {type PackageJson} from "../interfaces/PackageJson.js";

export type CliPackageJson = PackageJson;

export function CliPackageJson(): any {
  return Inject(CliPackageJson);
}

export function cliPackageJson() {
  return inject<PackageJson>(CliPackageJson);
}

injectable(CliPackageJson).factory(() => {
  return constant("pkg", {});
});
