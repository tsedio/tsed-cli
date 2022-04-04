import {CliPackageJson, Inject, registerProvider} from "@tsed/cli-core";
import {getValue} from "@tsed/core";
import {ProjectConvention, ArchitectureConvention} from "../interfaces";

export interface FeatureValue {
  type: string;
  dependencies?: {[key: string]: string | undefined};
  devDependencies?: {[key: string]: string | undefined};
}

export interface Feature {
  name: string;
  value: FeatureValue;
}

export type Features = Feature[];

export function Features() {
  return Inject(Features);
}

export function hasFeature(feature: string) {
  return (ctx: any): boolean => !!ctx.features.find((item: any) => item.type === feature);
}

export function hasValue(expression: string, value: any) {
  return (ctx: any) => getValue(expression, ctx) === value;
}

export function isPlatform(...types: string[]) {
  return (ctx: any) => [types].includes(ctx.platform);
}

export const FEATURES_TYPEORM_CONNECTION_TYPES = [
  {
    name: "MySQL",
    value: {
      type: "typeorm:mysql",
      dependencies: {
        mysql2: "latest"
      }
    }
  },
  {
    name: "MariaDB",
    value: {
      type: "typeorm:mariadb",
      dependencies: {
        mariadb: "latest"
      }
    }
  },
  {
    name: "Postgres",
    value: {
      type: "typeorm:postgres",
      dependencies: {
        pg: "latest"
      }
    }
  },
  {
    name: "CockRoachDB",
    value: {
      type: "typeorm:postgres",
      dependencies: {
        cockroachdb: "latest"
      }
    }
  },
  {
    name: "SQLite",
    value: {
      type: "typeorm:sqlite",
      dependencies: {
        sqlite3: "latest"
      }
    }
  },
  {
    name: "Better SQLite3",
    value: {
      type: "typeorm:better-sqlite3",
      dependencies: {
        "better-sqlite3": "latest"
      }
    }
  },
  {
    name: "Cordova",
    value: {
      type: "typeorm:cordova"
    }
  },
  {
    name: "NativeScript",
    value: {
      type: "typeorm:nativescript"
    }
  },
  {
    name: "Oracle",
    value: {
      type: "typeorm:oracle",
      dependencies: {
        oracledb: "latest"
      }
    }
  },
  {
    name: "MsSQL",
    value: {
      type: "typeorm:mssql",
      dependencies: {
        mssql: "latest"
      }
    }
  },
  {
    name: "MongoDB",
    value: {
      type: "typeorm:mongodb",
      dependencies: {
        mongodb: "latest"
      }
    }
  },
  {
    name: "SQL.js",
    value: {
      type: "typeorm:sqljs",
      dependencies: {}
    }
  },
  {
    name: "ReactNative",
    value: {
      type: "typeorm:reactnative",
      dependencies: {}
    }
  },
  {
    name: "Expo",
    value: {
      type: "typeorm:expo",
      dependencies: {}
    }
  }
];

const babelDevDependencies = {
  "@babel/cli": "latest",
  "@babel/core": "latest",
  "@babel/node": "latest",
  "@babel/plugin-proposal-class-properties": "latest",
  "@babel/plugin-proposal-decorators": "latest",
  "@babel/preset-env": "latest",
  "@babel/preset-typescript": "latest",
  "babel-plugin-transform-typescript-metadata": "latest",
  "babel-watch": "latest"
};

const platformChoices = [
  {
    name: "Express.js",
    checked: true,
    value: "express"
  },
  {
    name: "Koa.js",
    checked: false,
    value: "koa"
  }
];

const conventionChoices = [
  {
    name: "Ts.ED",
    checked: true,
    value: ProjectConvention.DEFAULT
  },
  {
    name: "Angular",
    checked: false,
    value: ProjectConvention.ANGULAR
  }
];

const featureChoices = (cliVersion: string) => [
  {
    name: "GraphQL",
    value: {
      type: "graphql",
      dependencies: {
        "@tsed/graphql": "{{tsedVersion}}",
        "apollo-datasource": "^3.3.1",
        "apollo-datasource-rest": "^3.5.1",
        "apollo-server-core": "^3.6.2",
        "type-graphql": "^1.1.1",
        "class-validator": "^0.13.2",
        graphql: "^15.7.2"
      },
      devDependencies: {
        "@types/validator": "latest",
        "apollo-server-testing": "latest"
      }
    }
  },
  {
    name: "Database",
    value: {type: "db"}
  },
  {
    name: "Passport.js",
    when: isPlatform("express"),
    value: {
      type: "passportjs",
      devDependencies: {
        "@tsed/cli-plugin-passport": cliVersion
      }
    }
  },
  {
    name: "Socket.io",
    value: {
      type: "socketio",
      dependencies: {
        "@tsed/socketio": "{{tsedVersion}}",
        "socket.io": "latest"
      }
    }
  },
  {
    name: "Swagger",
    value: {
      type: "swagger",
      dependencies: {
        "@tsed/swagger": "{{tsedVersion}}"
      }
    }
  },
  {
    name: "OpenID Connect provider",
    value: {
      type: "oidc",
      devDependencies: {
        "@tsed/cli-plugin-oidc-provider": cliVersion
      }
    }
  },
  {
    name: "Testing",
    value: {
      type: "testing",
      dependencies: {},
      devDependencies: {
        "@types/supertest": "latest",
        supertest: "latest"
      }
    }
  },
  {
    name: "Linter",
    value: {
      type: "linter"
    }
  },
  {
    name: "Bundler",
    value: {
      type: "bundler"
    }
  },
  {
    name: "Commands",
    value: {
      type: "commands",
      dependencies: {
        "@tsed/cli-core": cliVersion
      }
    }
  }
];

const featuresDbChoices = (cliVersion: string) => [
  {
    name: "Prisma",
    value: {
      type: "prisma",
      devDependencies: {
        "@tsed/cli-plugin-prisma": cliVersion
      }
    }
  },
  {
    name: "Mongoose",
    value: {
      type: "mongoose",
      devDependencies: {
        "@tsed/cli-plugin-mongoose": cliVersion
      }
    }
  },
  {
    name: "TypeORM",
    value: {
      type: "typeorm",
      devDependencies: {
        "@tsed/cli-plugin-typeorm": cliVersion
      }
    }
  }
];

const featuresTestingChoices = (cliVersion: string) => [
  {
    name: "Jest",
    value: {
      type: "jest",
      devDependencies: {
        "@tsed/cli-plugin-jest": cliVersion
      }
    }
  },
  {
    name: "Mocha + Chai + Sinon",
    value: {
      type: "mocha",
      devDependencies: {
        "@tsed/cli-plugin-mocha": cliVersion
      }
    }
  }
];

const featuresLinterChoices = (cliVersion: string) => [
  {
    name: "EsLint",
    checked: true,
    value: {
      type: "eslint",
      devDependencies: {
        "@tsed/cli-plugin-eslint": cliVersion
      }
    }
  }
];

const featuresExtraLinterChoices = [
  {
    name: "Prettier",
    value: {
      type: "prettier"
    }
  },
  {
    name: "Lint on commit",
    value: {
      type: "lintstaged"
    }
  }
];

const featuresBundlerChoices = [
  {
    name: "Babel",
    value: {
      type: "babel",
      devDependencies: {
        ...babelDevDependencies
      }
    }
  },
  {
    name: "Webpack",
    value: {
      type: "babel:webpack",
      devDependencies: {
        ...babelDevDependencies,
        "babel-loader": "latest",
        webpack: "latest",
        "webpack-cli": "latest"
      }
    }
  }
];

const packageManagerChoices = [
  {
    name: "Yarn",
    checked: true,
    value: "yarn"
  },
  {
    name: "NPM",
    checked: false,
    value: "npm"
  },
  {
    name: "PNPM",
    checked: false,
    value: "pnpm"
  }
];

export const parseFeaturesFile = (features: Record<string, any>, cliVersion: string) => {
  return {
    platform: features.platform,
    convention: features.convention,
    features: [
      ...featureChoices(cliVersion)
        .map((v) => v.value)
        .filter((v) => features.features.filter((v: string | Record<string, any>) => typeof v === "string").includes(v.type)),
      ...features.features.filter((v: string | Record<string, any>) => typeof v === "object")
    ],
    featuresDB: featuresDbChoices(cliVersion).find((v) => v.value.type === features.featuresDB)?.value,
    featuresTypeORM: FEATURES_TYPEORM_CONNECTION_TYPES.find((v) => v.value.type === features.featuresTypeORM)?.value,
    featuresTesting: featuresTestingChoices(cliVersion).find((v) => v.value.type === features.featuresTesting)?.value,
    featuresLinter: featuresLinterChoices(cliVersion).find((v) => v.value.type === features.featuresLinter)?.value,
    featuresExtraLinter: featuresExtraLinterChoices.map((v) => v.value).filter((v) => features.featuresExtraLinter?.includes(v.type)),
    featuresBundler: featuresBundlerChoices.find((v) => v.value.type === features.featuresBundlerChoices)?.value,
    packageManager: features.packageManager
  };
};

export const getFeaturesChoicesValues = (cliVersion: string) => {
  return {
    platform: platformChoices.map((v) => v.value),
    convention: conventionChoices.map((v) => v.value),
    features: featureChoices(cliVersion).map((v) => v.value.type),
    featuresDB: featuresDbChoices(cliVersion).map((v) => v.value.type),
    featuresTypeORM: FEATURES_TYPEORM_CONNECTION_TYPES.map((v) => v.value.type),
    featuresTesting: featuresTestingChoices(cliVersion).map((v) => v.value.type),
    featuresLinter: featuresLinterChoices(cliVersion).map((v) => v.value.type),
    featuresExtraLinter: featuresExtraLinterChoices.map((v) => v.value.type),
    featuresBundler: featuresBundlerChoices.map((v) => v.value.type),
    packageManager: packageManagerChoices.map((v) => v.value)
  };
};

registerProvider({
  provide: Features,
  deps: [CliPackageJson],
  useFactory(cliPackageJson: CliPackageJson) {
    const cliVersion = cliPackageJson.version;

    return [
      {
        message: "Choose the target platform:",
        type: "list",
        name: "platform",
        choices: platformChoices
      },
      {
        message: "Choose the architecture for your project:",
        type: "list",
        name: "architecture",
        choices: [
          {
            name: "Ts.ED",
            checked: true,
            value: ArchitectureConvention.DEFAULT
          },
          {
            name: "feature",
            checked: false,
            value: ArchitectureConvention.FEATURE
          }
        ]
      },
      {
        message: "Choose the convention file styling:",
        type: "list",
        name: "convention",
        choices: conventionChoices
      },
      {
        type: "checkbox",
        name: "features",
        message: "Check the features needed for your project",
        choices: featureChoices(cliVersion)
      },
      {
        message: "Choose a ORM manager",
        type: "list",
        name: "featuresDB",
        when: hasFeature("db"),
        choices: featuresDbChoices(cliVersion)
      },
      {
        type: "list",
        name: "featuresTypeORM",
        message: "Which TypeORM you want to install?",
        choices: FEATURES_TYPEORM_CONNECTION_TYPES,
        when: hasValue("featuresDB.type", "typeorm")
      },
      // {
      //   type: "password",
      //   name: "GH_TOKEN",
      //   message:
      //     "Enter GH_TOKEN to use the premium @tsedio/prisma package or leave blank (see https://tsed.io/tutorials/prisma-client.html)",
      //   when: hasValue("featuresDB.type", "prisma")
      // },
      {
        message: "Choose unit framework",
        type: "list",
        name: "featuresTesting",
        when: hasFeature("testing"),
        choices: featuresTestingChoices(cliVersion)
      },
      {
        message: "Choose linter tools framework",
        type: "list",
        name: "featuresLinter",
        when: hasFeature("linter"),
        choices: featuresLinterChoices(cliVersion)
      },
      {
        message: "Choose extra linter tools",
        type: "checkbox",
        name: "featuresExtraLinter",
        when: hasFeature("linter"),
        choices: featuresExtraLinterChoices
      },
      {
        message: "Choose your bundler",
        type: "list",
        name: "featuresBundler",
        when: hasFeature("bundler"),
        choices: featuresBundlerChoices
      },
      {
        message: "Choose the OIDC base path server",
        name: "oidcBasePath",
        default: "/oidc",
        when: hasFeature("oidc"),
        type: "input"
      },
      {
        message: "Choose the OIDC base path server",
        name: "oidcBasePath",
        default: "/oidc",
        when: hasFeature("oidc"),
        type: "input"
      },
      {
        message: "Choose the package manager:",
        type: "list",
        name: "packageManager",
        choices: packageManagerChoices
      }
    ];
  }
});
