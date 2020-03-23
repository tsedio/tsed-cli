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

function hasFeature(feature: string, ctx: {features: FeatureValue[]}) {
  return ctx.features.find(item => item.type === feature);
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
              },
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
                "@tsed/testing": "{{tsedVersion}}",
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
          }
        ]
      },
      {
        message: "Choose a ORM manager",
        type: "list",
        name: "featuresDB",
        when(ctx: {features: FeatureValue[]}) {
          return hasFeature("db", ctx);
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
          return hasFeature("testing", ctx);
        },
        choices: [
          {
            name: "Mocha + Chai + Sinon",
            value: {
              type: "mocha",
              devDependencies: {
                "@tsed/cli-plugin-mocha": cliVersion
              }
            }
          },
          {
            name: "Jest",
            value: {
              type: "jest",
              devDependencies: {
                "@tsed/cli-plugin-jest": cliVersion
              }
            }
          }
        ]
      },
      {
        message: "Choose linter tools",
        type: "checkbox",
        name: "featuresLinter",
        when(ctx: {features: FeatureValue[]}) {
          return hasFeature("linter", ctx);
        },
        choices: [
          {
            name: "TsLint",
            checked: true,
            value: {
              type: "tslint",
              devDependencies: {
                "@tsed/cli-plugin-tslint": cliVersion
              }
            }
          },
          {
            name: "Prettier",
            value: {
              type: "tslint:prettier",
              devDependencies: {
                "@tsed/cli-plugin-tslint": cliVersion
              }
            }
          },
          {
            name: "Lint on commit",
            value: {
              type: "tslint:lintstaged",
              devDependencies: {
                "@tsed/cli-plugin-tslint": cliVersion
              }
            }
          }
        ]
      }
    ];
  }
});
