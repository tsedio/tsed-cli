import {ArchitectureConvention, PlatformType, ProjectConvention} from "@tsed/cli";
import {PackageManager} from "@tsed/cli-core";
import {mapToContext} from "./mapToContext";
import {FeatureType} from "../config/FeaturesPrompt";

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
        FeatureType.BUNDLER,
        FeatureType.COMMANDS
      ],
      featuresDB: FeatureType.TYPEORM,
      featuresTypeORM: FeatureType.TYPEORM_MARIADB,
      packageManager: PackageManager.PNPM
    });
    expect(result).toEqual({
      architecture: "feature",
      bundler: true,
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
        "bundler",
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
      typeorm: true
    });
  });
});
