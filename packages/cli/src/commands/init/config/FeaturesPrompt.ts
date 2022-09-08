import {PackageManager} from "@tsed/cli-core";
import {isPlatform} from "../utils/isPlatform";
import {hasFeature, hasValue} from "../utils/hasFeature";
import {InitOptions} from "../interfaces/InitOptions";
import {ArchitectureConvention, PlatformType, ProjectConvention} from "../../../interfaces";

export interface Feature {
  name: string;
  value?: any;
  checked?: boolean | ((opts: Partial<InitOptions>) => boolean);
  when?: (opts: any) => boolean;
  dependencies?: Record<string, any>;
  devDependencies?: Record<string, any>;
}

export enum FeatureType {
  GRAPHQL = "graphql",
  SOCKETIO = "socketio",
  SWAGGER = "swagger",
  OIDC = "oidc",
  PASSPORTJS = "passportjs",
  COMMANDS = "commands",
  DB = "db",

  // ORM
  PRISMA = "prisma",

  MONGOOSE = "mongoose",

  // TYPEORM
  TYPEORM = "typeorm",
  TYPEORM_MYSQL = "typeorm:mysql",
  TYPEORM_MARIADB = "typeorm:mariadb",
  TYPEORM_POSTGRES = "typeorm:postgres",
  TYPEORM_COCKROACHDB = "typeorm:cockroachdb",
  TYPEORM_SQLITE = "typeorm:sqlite",
  TYPEORM_BETTER_SQLITE3 = "typeorm:better-sqlite3",
  TYPEORM_CORDOVA = "typeorm:cordova",
  TYPEORM_NATIVESCRIPT = "typeorm:nativescript",
  TYPEORM_ORACLE = "typeorm:oracle",
  TYPEORM_MSSQL = "typeorm:mssql",
  TYPEORM_MONGODB = "typeorm:mongodb",
  TYPEORM_SQLJS = "typeorm:sqljs",
  TYPEORM_REACTNATIVE = "typeorm:reactnative",
  TYPEORM_EXPO = "typeorm:expo",

  // TESTING
  TESTING = "testing",
  JEST = "jest",
  MOCHA = "mocha",
  LINTER = "linter",
  ESLINT = "eslint",
  LINT_STAGED = "lintstaged",
  PRETTIER = "prettier",

  // BUNDLER
  BUNDLER = "bundler",
  BABEL = "babel",
  WEBPACK = "babel:webpack"
}

export const FeaturesMap: Record<string, Feature> = {
  [PlatformType.EXPRESS]: {
    name: "Express.js",
    checked: (options: any) => options.platform !== PlatformType.KOA
  },
  [PlatformType.KOA]: {
    name: "Koa.js",
    checked: (options: any) => options.platform === PlatformType.KOA
  },
  [FeatureType.GRAPHQL]: {
    name: "TypeGraphQL",
    dependencies: {
      "@tsed/typegraphql": "{{tsedVersion}}"
    },
    devDependencies: {
      "@tsed/cli-plugin-typegraphql": "{{cliVersion}}"
    }
  },
  [FeatureType.DB]: {
    name: "Database"
  },
  [FeatureType.PASSPORTJS]: {
    name: "Passport.js",
    when: isPlatform(PlatformType.EXPRESS),
    devDependencies: {
      "@tsed/cli-plugin-passport": "{{cliVersion}}"
    }
  },
  [FeatureType.SOCKETIO]: {
    name: "Socket.io",
    dependencies: {
      "@tsed/socketio": "{{tsedVersion}}",
      "socket.io": "latest"
    }
  },
  [FeatureType.SWAGGER]: {
    name: "Swagger",
    dependencies: {
      "@tsed/swagger": "{{tsedVersion}}"
    }
  },
  [FeatureType.OIDC]: {
    name: "OpenID Connect provider",
    devDependencies: {
      "@tsed/cli-plugin-oidc-provider": "{{cliVersion}}"
    }
  },
  [FeatureType.TESTING]: {
    name: "Testing",
    dependencies: {},
    devDependencies: {
      "@types/supertest": "latest",
      supertest: "latest"
    }
  },
  [FeatureType.LINTER]: {
    name: "Linter"
  },
  [FeatureType.BUNDLER]: {
    name: "Bundler"
  },
  [FeatureType.COMMANDS]: {
    name: "Commands",
    dependencies: {
      "@tsed/cli-core": "{{cliVersion}}"
    },
    devDependencies: {
      "@types/inquirer": "latest"
    }
  },

  [ProjectConvention.DEFAULT]: {
    name: "Ts.ED",
    checked: true
  },
  [ProjectConvention.ANGULAR]: {
    name: "Angular",
    checked: false
  },
  [ArchitectureConvention.DEFAULT]: {
    name: "Ts.ED",
    checked: true
  },
  [ArchitectureConvention.FEATURE]: {
    name: "Feature",
    checked: false
  },
  [FeatureType.TYPEORM_MYSQL]: {
    name: "MySQL",
    dependencies: {
      mysql2: "latest"
    }
  },
  [FeatureType.TYPEORM_MARIADB]: {
    name: "MariaDB",
    dependencies: {
      mariadb: "latest"
    }
  },
  [FeatureType.TYPEORM_POSTGRES]: {
    name: "Postgres",
    dependencies: {
      pg: "latest"
    }
  },
  [FeatureType.TYPEORM_COCKROACHDB]: {
    name: "CockRoachDB",
    dependencies: {
      cockroachdb: "latest"
    }
  },
  [FeatureType.TYPEORM_SQLITE]: {
    name: "SQLite",
    dependencies: {
      sqlite3: "latest"
    }
  },
  [FeatureType.TYPEORM_BETTER_SQLITE3]: {
    name: "Better SQLite3",
    dependencies: {
      "better-sqlite3": "latest"
    }
  },
  [FeatureType.TYPEORM_CORDOVA]: {
    name: "Cordova"
  },
  [FeatureType.TYPEORM_NATIVESCRIPT]: {
    name: "NativeScript"
  },
  [FeatureType.TYPEORM_ORACLE]: {
    name: "Oracle",
    dependencies: {
      oracledb: "latest"
    }
  },
  [FeatureType.TYPEORM_MSSQL]: {
    name: "MsSQL",

    dependencies: {
      mssql: "latest"
    }
  },
  [FeatureType.TYPEORM_MONGODB]: {
    name: "MongoDB",
    dependencies: {
      mongodb: "latest"
    }
  },
  [FeatureType.TYPEORM_SQLJS]: {
    name: "SQL.js"
  },
  [FeatureType.TYPEORM_REACTNATIVE]: {
    name: "ReactNative"
  },
  [FeatureType.TYPEORM_EXPO]: {
    name: "Expo"
  },
  [FeatureType.PRISMA]: {
    name: "Prisma",
    devDependencies: {
      "@tsed/cli-plugin-prisma": "{{cliVersion}}"
    }
  },
  [FeatureType.MONGOOSE]: {
    name: "Mongoose",

    devDependencies: {
      "@tsed/cli-plugin-mongoose": "{{cliVersion}}"
    }
  },
  [FeatureType.TYPEORM]: {
    name: "TypeORM",
    devDependencies: {
      "@tsed/cli-plugin-typeorm": "{{cliVersion}}"
    }
  },
  [FeatureType.JEST]: {
    name: "Jest",
    devDependencies: {
      "@tsed/cli-plugin-jest": "{{cliVersion}}"
    }
  },
  [FeatureType.MOCHA]: {
    name: "Mocha + Chai + Sinon",
    devDependencies: {
      "@tsed/cli-plugin-mocha": "{{cliVersion}}"
    }
  },
  [FeatureType.ESLINT]: {
    name: "EsLint",
    checked: true,
    devDependencies: {
      "@tsed/cli-plugin-eslint": "{{cliVersion}}"
    }
  },
  [FeatureType.PRETTIER]: {
    name: "Prettier"
  },
  [FeatureType.LINT_STAGED]: {
    name: "Lint on commit"
  },
  [FeatureType.BABEL]: {
    name: "Babel",
    devDependencies: {
      "@babel/cli": "latest",
      "@babel/core": "latest",
      "@babel/node": "latest",
      "@babel/plugin-proposal-class-properties": "latest",
      "@babel/plugin-proposal-decorators": "latest",
      "@babel/preset-env": "latest",
      "@babel/preset-typescript": "latest",
      "babel-plugin-transform-typescript-metadata": "latest",
      "babel-watch": "latest"
    }
  },
  [FeatureType.WEBPACK]: {
    name: "Webpack",
    devDependencies: {
      "@babel/cli": "latest",
      "@babel/core": "latest",
      "@babel/node": "latest",
      "@babel/plugin-proposal-class-properties": "latest",
      "@babel/plugin-proposal-decorators": "latest",
      "@babel/preset-env": "latest",
      "@babel/preset-typescript": "latest",
      "babel-plugin-transform-typescript-metadata": "latest",
      "babel-watch": "latest",
      "babel-loader": "latest",
      webpack: "latest",
      "webpack-cli": "latest"
    }
  },
  [PackageManager.YARN]: {
    name: "Yarn",
    checked: true
  },
  [PackageManager.NPM]: {
    name: "NPM",
    checked: false
  },
  [PackageManager.PNPM]: {
    name: "PNPM - experimental",
    checked: false
  }
};

export const FeaturesPrompt = () => [
  {
    message: "Choose the target platform:",
    type: "list",
    name: "platform",
    choices: [PlatformType.EXPRESS, PlatformType.KOA]
  },
  {
    message: "Choose the architecture for your project:",
    type: "list",
    name: "architecture",
    choices: [ArchitectureConvention.DEFAULT, ArchitectureConvention.FEATURE]
  },
  {
    message: "Choose the convention file styling:",
    type: "list",
    name: "convention",
    choices: [ProjectConvention.DEFAULT, ProjectConvention.ANGULAR]
  },
  {
    type: "checkbox",
    name: "features",
    message: "Check the features needed for your project",
    choices: [
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
    ]
  },
  {
    message: "Choose a ORM manager",
    type: "list",
    name: "featuresDB",
    when: hasFeature(FeatureType.DB),
    choices: [FeatureType.PRISMA, FeatureType.MONGOOSE, FeatureType.TYPEORM]
  },
  {
    type: "list",
    name: "featuresTypeORM",
    message: "Which TypeORM you want to install?",
    choices: [
      FeatureType.TYPEORM_MYSQL,
      FeatureType.TYPEORM_MARIADB,
      FeatureType.TYPEORM_POSTGRES,
      FeatureType.TYPEORM_COCKROACHDB,
      FeatureType.TYPEORM_SQLITE,
      FeatureType.TYPEORM_BETTER_SQLITE3,
      FeatureType.TYPEORM_CORDOVA,
      FeatureType.TYPEORM_NATIVESCRIPT,
      FeatureType.TYPEORM_ORACLE,
      FeatureType.TYPEORM_MSSQL,
      FeatureType.TYPEORM_MONGODB,
      FeatureType.TYPEORM_SQLJS,
      FeatureType.TYPEORM_REACTNATIVE,
      FeatureType.TYPEORM_EXPO
    ],
    when: hasValue("featuresDB", FeatureType.TYPEORM)
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
    when: hasFeature(FeatureType.TESTING),
    choices: [FeatureType.JEST, FeatureType.MOCHA]
  },
  {
    message: "Choose linter tools framework",
    type: "list",
    name: "featuresLinter",
    when: hasFeature(FeatureType.LINTER),
    choices: [FeatureType.ESLINT]
  },
  {
    message: "Choose extra linter tools",
    type: "checkbox",
    name: "featuresExtraLinter",
    when: hasFeature(FeatureType.LINTER),
    choices: [FeatureType.PRETTIER, FeatureType.LINT_STAGED]
  },
  {
    message: "Choose your bundler",
    type: "list",
    name: "featuresBundler",
    when: hasFeature(FeatureType.BUNDLER),
    choices: [FeatureType.BABEL, FeatureType.WEBPACK]
  },
  {
    message: "Choose the OIDC base path server",
    name: "oidcBasePath",
    default: "/oidc",
    when: hasFeature(FeatureType.OIDC),
    type: "input"
  },
  {
    message: "Choose the package manager:",
    type: "list",
    name: "packageManager",
    choices: [PackageManager.YARN, PackageManager.NPM, PackageManager.PNPM]
  }
];
