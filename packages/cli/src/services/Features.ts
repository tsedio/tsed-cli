import {CliPackageJson, Inject, registerProvider} from "@tsed/cli-core";

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

registerProvider({
  provide: Features,
  deps: [CliPackageJson],
  useFactory(cliPackageJson: CliPackageJson) {
    const cliVersion = cliPackageJson.version;

    return [
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
                "@tsed/graphql": "{{tsedVersion}}"
              }
            }
          },
          {
            name: "Database",
            value: {type: "db"}
          },
          {
            name: "File uploading with Multer",
            value: {
              type: "multer",
              dependencies: {
                "@tsed/multipartfiles": "{{tsedVersion}}"
              }
            }
          },
          {
            name: "Passport.js",
            value: {
              type: "passportjs",
              dependencies: {
                "@tsed/passport": "{{tsedVersion}}"
              }
            }
          },
          {
            name: "Socket.io",
            value: {
              type: "socketio",
              dependencies: {
                "@tsed/socketio": "{{tsedVersion}}"
              }
            }
          },
          {
            name: "Swagger",
            value: {
              type: "swagger",
              dependencies: {
                "@types/swagger-schema-official": "2.0.20",
                "@tsed/swagger": "{{tsedVersion}}"
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
                "@tsed/testing": "{{tsedVersion}}",
                supertest: "latest"
              }
            }
          },
          {
            name: "Linter",
            value: {
              type: "linter"
            }
          }
        ]
      },
      {
        message: "Choose a ORM manager",
        type: "list",
        name: "featuresDB",
        when(ctx: {features: FeatureValue[]}) {
          return ctx.features.find(item => item.type === "db");
        },
        choices: [
          {
            name: "Mongoose",
            value: {
              type: "mongoose",
              dependencies: {
                "@tsed/mongoose": "{{tsedVersion}}"
              },
              devDependencies: {
                // "@tsed/cli-plugin-mongoose": cliVersion
              }
            }
          },
          {
            name: "TypeORM",
            value: {
              type: "typeorm",
              dependencies: {
                "@tsed/typeorm": "{{tsedVersion}}"
              },
              devDependencies: {
                // "@tsed/cli-plugin-typeorm": cliVersion
              }
            }
          }
        ]
      },
      {
        message: "Choose unit framework",
        type: "list",
        name: "featuresTesting",
        when(ctx: {features: FeatureValue[]}) {
          return ctx.features.find(item => item.type === "testing");
        },
        choices: [
          {
            name: "Mocha + Chai + Sinon",
            value: {
              type: "mongoose",
              scripts: {
                test: "yarn clean && yarn test:lint && yarn test:coverage",
                "test:unit": "cross-env NODE_ENV=test mocha",
                "test:coverage": "cross-env NODE_ENV=test nyc mocha"
              },
              dependencies: {},
              devDependencies: {
                "@types/chai": "latest",
                "@types/chai-as-promised": "latest",
                "@types/mocha": "latest",
                "@types/sinon": "latest",
                "@types/sinon-chai": "latest",
                "@tsed/cli-plugin-mocha": cliVersion,
                chai: "latest",
                "chai-as-promised": "latest",
                mocha: "latest",
                nyc: "latest",
                sinon: "latest",
                "sinon-chai": "latest"
              }
            }
          },
          {
            name: "Jest",
            value: {
              type: "jest",
              dependencies: {},
              devDependencies: {
                "@tsed/cli-plugin-jest": cliVersion,
                jest: "latest"
              }
            }
          }
        ]
      },
      {
        message: "Choose linter tools",
        type: "list",
        name: "featuresLinter",
        when(ctx: {features: FeatureValue[]}) {
          return ctx.features.find(item => item.type === "linter");
        },
        choices: [
          {
            name: "TsLint",
            value: {
              type: "tslint",
              scripts: {
                "test:lint": "tslint --project tsconfig.json",
                "test:lint:fix": "tslint --project tsconfig.json --fix"
              },
              dependencies: {},
              devDependencies: {
                "lint-staged": "latest",
                tslint: "latest"
              }
            }
          },
          {
            name: "TsLint + Prettier",
            value: {
              type: "tslint:prettier",
              scripts: {
                "test:lint": "tslint --project tsconfig.json",
                "test:lint:fix": "tslint --project tsconfig.json --fix"
              },
              dependencies: {},
              devDependencies: {
                "lint-staged": "latest",
                tslint: "latest",
                prettier: "latest"
              }
            }
          }
        ]
      }
    ];
  }
});
