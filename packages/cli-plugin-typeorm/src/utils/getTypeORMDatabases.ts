import {FeaturesMap, type GenerateCmdContext} from "@tsed/cli";
import type {CliDatabases} from "@tsed/cli-core";

export function getTypeORMDatabases() {
  return Object.entries(FeaturesMap).filter(([value]) => value.startsWith("typeorm:"));
}

export function getDatabase(data: GenerateCmdContext): CliDatabases | undefined {
  return data.typeormDataSource?.split(":").at(-1)! as CliDatabases;
}
