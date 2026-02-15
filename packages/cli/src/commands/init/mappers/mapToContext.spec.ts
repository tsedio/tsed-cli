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
        FeatureType.ORM,
        FeatureType.PASSPORTJS,
        FeatureType.SOCKETIO,
        FeatureType.SWAGGER,
        FeatureType.OIDC,
        FeatureType.TESTING,
        FeatureType.LINTER,
        FeatureType.COMMANDS,
        FeatureType.CONFIG_POSTGRES
      ],
      featuresDB: FeatureType.TYPEORM,
      featuresTypeORM: FeatureType.TYPEORM_MARIADB,
      packageManager: PackageManager.PNPM,
      runtime: "node"
    });
    expect(result).toMatchInlineSnapshot(`
      {
        "architecture": "feature",
        "commands": true,
        "config": true,
        "configPostgres": true,
        "convention": "angular",
        "doc": true,
        "docSwagger": true,
        "features": [
          "graphql",
          "orm",
          "passportjs",
          "socketio",
          "doc:swagger",
          "oidc",
          "testing",
          "linter",
          "commands",
          "config:postgres:premium",
          "orm:typeorm",
          "orm:typeorm:mariadb",
        ],
        "graphql": true,
        "linter": true,
        "oidc": true,
        "orm": true,
        "ormTypeorm": true,
        "ormTypeormMariadb": true,
        "packageManager": "pnpm",
        "passportjs": true,
        "platform": "koa",
        "postgres": true,
        "premium": true,
        "projectName": "name",
        "root": ".",
        "runtime": "node",
        "socketio": true,
        "swagger": true,
        "testing": true,
        "typeorm": true,
      }
    `);
  });
});
