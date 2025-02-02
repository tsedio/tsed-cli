import {ArchitectureConvention, PlatformType, ProjectConvention} from "../../../interfaces/index.js";
import type {InitOptions} from "../interfaces/InitOptions.js";
import {hasFeature, hasValue} from "../utils/hasFeature.js";
import {isPlatform} from "../utils/isPlatform.js";

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
  OIDC = "oidc",
  PASSPORTJS = "passportjs",
  COMMANDS = "commands",
  DB = "db",
  DOC = "doc",

  // DOC
  SWAGGER = "swagger",
  SCALAR = "scalar",

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
  VITEST = "vitest",
  LINTER = "linter",
  ESLINT = "eslint",
  LINT_STAGED = "lintstaged",
  PRETTIER = "prettier"
}

export const FeaturesMap: Record<string, Feature> = {
  [PlatformType.EXPRESS]: {
    name: "Express.js",
    checked: (options: any) => options.platform === PlatformType.EXPRESS || !options.platform
  },
  [PlatformType.KOA]: {
    name: "Koa.js",
    checked: (options: any) => options.platform === PlatformType.KOA
  },
  [PlatformType.FASTIFY]: {
    name: "Fastify.js (beta)",
    checked: (options: any) => options.platform === PlatformType.FASTIFY
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
  [FeatureType.DOC]: {
    name: "Documentation"
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
  [FeatureType.SCALAR]: {
    name: "Scalar",
    dependencies: {
      "@tsed/scalar": "{{tsedVersion}}"
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
  [FeatureType.COMMANDS]: {
    name: "Commands",
    dependencies: {
      "@tsed/cli-core": "{{cliVersion}}"
    },
    devDependencies: {
      "@types/inquirer": "^8.2.4"
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
      "@tsed/cli-plugin-typeorm": "{{cliVersion}}",
      typeorm: "latest"
    }
  },
  [FeatureType.VITEST]: {
    name: "Vitest",
    devDependencies: {
      "@tsed/cli-plugin-vitest": "{{cliVersion}}"
    }
  },
  [FeatureType.JEST]: {
    name: "Jest (unstable with ESM)",
    devDependencies: {
      "@tsed/cli-plugin-jest": "{{cliVersion}}"
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
  node: {
    name: "Node.js + SWC",
    checked: true
  },
  babel: {
    name: "Node.js + Babel",
    checked: false
  },
  webpack: {
    name: "Node.js + Webpack",
    checked: false
  },
  bun: {
    name: "Bun.js",
    checked: false
  },
  yarn: {
    name: "Yarn",
    checked: true
  },
  yarn_berry: {
    name: "Yarn Berry",
    checked: false
  },
  npm: {
    name: "NPM",
    checked: false
  },
  pnpm: {
    name: "PNPM",
    checked: false
  }
};

export const FrameworksPrompt = {
  message: "Choose the target Framework:",
  type: "list",
  name: "platform",
  choices: [PlatformType.EXPRESS, PlatformType.KOA, PlatformType.FASTIFY]
};

export const FeaturesPrompt = (availableRuntimes: string[], availablePackageManagers: string[]) => [
  FrameworksPrompt,
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
      FeatureType.DOC,
      FeatureType.OIDC,
      FeatureType.TESTING,
      FeatureType.LINTER,
      FeatureType.COMMANDS
    ]
  },
  {
    type: "checkbox",
    message: "Choose a documentation plugin",
    name: "featuresDoc",
    when: hasFeature(FeatureType.DOC),
    choices: [FeatureType.SWAGGER, FeatureType.SCALAR]
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
  //     "Enter GH_TOKEN to use the premium @tsedio/prisma package or leave blank (see https://tsed.dev/tutorials/prisma-client.html)",
  //   when: hasValue("featuresDB.type", "prisma")
  // },
  {
    message: "Choose unit framework",
    type: "list",
    name: "featuresTesting",
    when: hasFeature(FeatureType.TESTING),
    choices: [FeatureType.VITEST, FeatureType.JEST]
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
    message: "Choose the OIDC base path server",
    name: "oidcBasePath",
    default: "/oidc",
    when: hasFeature(FeatureType.OIDC),
    type: "input"
  },
  {
    message: "Choose the runtime:",
    type: "list",
    name: "runtime",
    choices: availableRuntimes
  },
  {
    message: "Choose the package manager:",
    type: "list",
    name: "packageManager",
    when: hasValue("runtime", ["node", "babel", "swc", "webpack"]),
    choices: availablePackageManagers
  }
];
