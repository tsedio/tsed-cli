import {CliPackageJson, Inject, registerProvider} from "@tsed/cli-core";
import {getValue} from "@tsed/core";
import {ProjectConvention, ArchitectureConvention} from "../interfaces";

export interface FeatureValue {
  type: string;
  dependencies?: {[key: string]: string};
  devDependencies?: {[key: string]: string};
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
        mysql: "latest"
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
        choices: [
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
        ]
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
        choices: [
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
        ]
      },
      {
        type: "checkbox",
        name: "features",
        message: "Check the features needed for your project",
        choices: [
          {
            name: "GraphQL",
            value: {
              type: "graphql",
              dependencies: {
                "@tsed/typegraphql": "{{tsedVersion}}",
                "apollo-datasource": "latest",
                "apollo-datasource-rest": "latest",
                "type-graphql": "latest",
                graphql: "^15.5.0",
                "class-validator": "latest"
              },
              devDependencies: {
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
        ]
      },
      {
        message: "Choose a ORM manager",
        type: "list",
        name: "featuresDB",
        when: hasFeature("db"),
        choices: [
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
        ]
      },
      {
        type: "list",
        name: "featuresTypeORM",
        message: "Which TypeORM you want to install?",
        choices: FEATURES_TYPEORM_CONNECTION_TYPES,
        when: hasValue("featuresDB.type", "typeorm")
      },
      {
        type: "password",
        name: "GH_TOKEN",
        message:
          "Enter GH_TOKEN to use the premium @tsedio/prisma package or leave blank (see https://tsed.io/tutorials/prisma-client.html)",
        when: hasValue("featuresDB.type", "prisma")
      },
      {
        message: "Choose unit framework",
        type: "list",
        name: "featuresTesting",
        when: hasFeature("testing"),
        choices: [
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
        ]
      },
      {
        message: "Choose linter tools framework",
        type: "list",
        name: "featuresLinter",
        when: hasFeature("linter"),
        choices: [
          {
            name: "EsLint",
            checked: true,
            value: {
              type: "eslint",
              devDependencies: {
                "@tsed/cli-plugin-eslint": cliVersion
              }
            }
          },
          {
            name: "TsLint (deprecated)",
            checked: true,
            value: {
              type: "tslint",
              devDependencies: {
                "@tsed/cli-plugin-tslint": cliVersion
              }
            }
          }
        ]
      },
      {
        message: "Choose extra linter tools",
        type: "checkbox",
        name: "featuresExtraLinter",
        when: hasFeature("linter"),
        choices: [
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
        ]
      },
      {
        message: "Choose your bundler",
        type: "list",
        name: "featuresBundler",
        when: hasFeature("bundler"),
        choices: [
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
        ]
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
        choices: [
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
        ]
      }
    ];
  }
});
