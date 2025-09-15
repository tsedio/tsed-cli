import {type CommandData, PackageManager} from "@tsed/cli-core";

import type {FeatureType} from "../commands/init/config/FeaturesPrompt.js";
import type {ArchitectureConvention} from "./ArchitectureConvention.js";
import type {PlatformType} from "./PlatformType.js";
import type {ProjectConvention} from "./ProjectConvention.js";
import type {RuntimeTypes} from "./RuntimeTypes.js";

declare global {
  namespace TsED {
    interface RenderDataContext {}
  }
}

export interface RenderDataContext extends CommandData, TsED.RenderDataContext {
  commandName: string;
  platform: PlatformType;
  convention: ProjectConvention;
  packageManager: PackageManager;
  architecture: ArchitectureConvention;
  runtime: RuntimeTypes;
  features?: FeatureType[];
  root?: string;
  premium?: boolean;
  projectName?: string;
  tsedVersion?: string;
  cliVersion?: string;
  oidcBasePath?: string;
  file?: string;
  route: string;
  express?: boolean;
  koa?: boolean;
  fastify?: boolean;
  swagger?: boolean;
  oidc?: boolean;
  graphql?: boolean;
  scalar?: boolean;
  mongoose?: boolean;
  typeorm?: boolean;
  passportjs?: boolean;
  config?: boolean;
  configEnvs?: boolean;
  configDotenv?: boolean;
  configJson?: boolean;
  configYaml?: boolean;
  configIoredis?: boolean;
  configMongo?: boolean;
  configAwsSecrets?: boolean;
  configVault?: boolean;
  configPostgres?: boolean;
  barrels?: string;
  bun?: boolean;
  node?: boolean;
  compiled?: boolean;
  testing?: boolean;
  commands?: boolean;
  eslint?: boolean;
  jest?: boolean;
  prettier?: boolean;
  vitest?: boolean;
  lintstaged?: boolean;
  prisma?: boolean;
  passport?: boolean;
}
