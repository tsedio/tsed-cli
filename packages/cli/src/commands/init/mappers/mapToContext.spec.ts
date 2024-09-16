import {PackageManager} from "@tsed/cli-core";

import {ArchitectureConvention, PlatformType, ProjectConvention} from "../../../../src/index.js";
import {FeatureType} from "../config/FeaturesPrompt.js";
import {mapToContext} from "./mapToContext.js";

describe("mapToContext", () => {
  it("should map to final object", () => {
    const result = mapToContext({
      root: ".",
      projectName: "name",
      platform: PlatformType.KOA,
      architecture: ArchitectureConvention.FEATURE,
      convention: ProjectConvention.ANGULAR,
      features: [
        FeatureType.GRAPHQL,
        FeatureType.DB,
        FeatureType.PASSPORTJS,
        FeatureType.SOCKETIO,
        FeatureType.SWAGGER,
        FeatureType.OIDC,
        FeatureType.TESTING,
        FeatureType.LINTER,
        FeatureType.COMMANDS
      ],
      featuresDB: FeatureType.TYPEORM,
      featuresTypeORM: FeatureType.TYPEORM_MARIADB,
      packageManager: PackageManager.PNPM,
      runtime: "node"
    });
    expect(result).toEqual({
      architecture: "feature",
      commands: true,
      convention: "angular",
      db: true,
      features: [
        "graphql",
        "db",
        "passportjs",
        "socketio",
        "swagger",
        "oidc",
        "testing",
        "linter",
        "commands",
        "typeorm",
        "typeorm:mariadb"
      ],
      graphql: true,
      linter: true,
      mariadb: true,
      oidc: true,
      packageManager: "pnpm",
      passportjs: true,
      platform: "koa",
      projectName: "name",
      root: ".",
      socketio: true,
      swagger: true,
      testing: true,
      typeorm: true,
      runtime: "node"
    });
  });
});
