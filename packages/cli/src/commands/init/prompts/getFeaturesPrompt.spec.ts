import {getFeaturesPrompt} from "./getFeaturesPrompt";

describe("getFeaturesPrompt", () => {
  it("should add a provider info", () => {
    const prompt = getFeaturesPrompt(["yarn", "npm", "pnpm"], {});

    expect(prompt).toBeInstanceOf(Array);
    expect(prompt).toMatchInlineSnapshot(`
      Array [
        Object {
          "choices": Array [
            Object {
              "checked": true,
              "name": "Express.js",
              "value": "express",
            },
            Object {
              "checked": false,
              "name": "Koa.js",
              "value": "koa",
            },
          ],
          "message": "Choose the target platform:",
          "name": "platform",
          "type": "list",
        },
        Object {
          "choices": Array [
            Object {
              "checked": true,
              "name": "Ts.ED",
              "value": "arc_default",
            },
            Object {
              "checked": false,
              "name": "Feature",
              "value": "feature",
            },
          ],
          "message": "Choose the architecture for your project:",
          "name": "architecture",
          "type": "list",
        },
        Object {
          "choices": Array [
            Object {
              "checked": true,
              "name": "Ts.ED",
              "value": "conv_default",
            },
            Object {
              "checked": false,
              "name": "Angular",
              "value": "angular",
            },
          ],
          "message": "Choose the convention file styling:",
          "name": "convention",
          "type": "list",
        },
        Object {
          "choices": Array [
            Object {
              "dependencies": Object {
                "@tsed/typegraphql": "{{tsedVersion}}",
              },
              "devDependencies": Object {
                "@tsed/cli-plugin-typegraphql": "{{cliVersion}}",
              },
              "name": "TypeGraphQL",
              "value": "graphql",
            },
            Object {
              "name": "Database",
              "value": "db",
            },
            Object {
              "devDependencies": Object {
                "@tsed/cli-plugin-passport": "{{cliVersion}}",
              },
              "name": "Passport.js",
              "value": "passportjs",
              "when": [Function],
            },
            Object {
              "dependencies": Object {
                "@tsed/socketio": "{{tsedVersion}}",
                "socket.io": "latest",
              },
              "name": "Socket.io",
              "value": "socketio",
            },
            Object {
              "dependencies": Object {
                "@tsed/swagger": "{{tsedVersion}}",
              },
              "name": "Swagger",
              "value": "swagger",
            },
            Object {
              "devDependencies": Object {
                "@tsed/cli-plugin-oidc-provider": "{{cliVersion}}",
              },
              "name": "OpenID Connect provider",
              "value": "oidc",
            },
            Object {
              "dependencies": Object {},
              "devDependencies": Object {
                "@types/supertest": "latest",
                "supertest": "latest",
              },
              "name": "Testing",
              "value": "testing",
            },
            Object {
              "name": "Linter",
              "value": "linter",
            },
            Object {
              "name": "Bundler",
              "value": "bundler",
            },
            Object {
              "dependencies": Object {
                "@tsed/cli-core": "{{cliVersion}}",
              },
              "devDependencies": Object {
                "@types/inquirer": "^8.2.4",
              },
              "name": "Commands",
              "value": "commands",
            },
          ],
          "message": "Check the features needed for your project",
          "name": "features",
          "type": "checkbox",
        },
        Object {
          "choices": Array [
            Object {
              "devDependencies": Object {
                "@tsed/cli-plugin-prisma": "{{cliVersion}}",
              },
              "name": "Prisma",
              "value": "prisma",
            },
            Object {
              "devDependencies": Object {
                "@tsed/cli-plugin-mongoose": "{{cliVersion}}",
              },
              "name": "Mongoose",
              "value": "mongoose",
            },
            Object {
              "devDependencies": Object {
                "@tsed/cli-plugin-typeorm": "{{cliVersion}}",
              },
              "name": "TypeORM",
              "value": "typeorm",
            },
          ],
          "message": "Choose a ORM manager",
          "name": "featuresDB",
          "type": "list",
          "when": [Function],
        },
        Object {
          "choices": Array [
            Object {
              "dependencies": Object {
                "mysql2": "latest",
              },
              "name": "MySQL",
              "value": "typeorm:mysql",
            },
            Object {
              "dependencies": Object {
                "mariadb": "latest",
              },
              "name": "MariaDB",
              "value": "typeorm:mariadb",
            },
            Object {
              "dependencies": Object {
                "pg": "latest",
              },
              "name": "Postgres",
              "value": "typeorm:postgres",
            },
            Object {
              "dependencies": Object {
                "cockroachdb": "latest",
              },
              "name": "CockRoachDB",
              "value": "typeorm:cockroachdb",
            },
            Object {
              "dependencies": Object {
                "sqlite3": "latest",
              },
              "name": "SQLite",
              "value": "typeorm:sqlite",
            },
            Object {
              "dependencies": Object {
                "better-sqlite3": "latest",
              },
              "name": "Better SQLite3",
              "value": "typeorm:better-sqlite3",
            },
            Object {
              "name": "Cordova",
              "value": "typeorm:cordova",
            },
            Object {
              "name": "NativeScript",
              "value": "typeorm:nativescript",
            },
            Object {
              "dependencies": Object {
                "oracledb": "latest",
              },
              "name": "Oracle",
              "value": "typeorm:oracle",
            },
            Object {
              "dependencies": Object {
                "mssql": "latest",
              },
              "name": "MsSQL",
              "value": "typeorm:mssql",
            },
            Object {
              "dependencies": Object {
                "mongodb": "latest",
              },
              "name": "MongoDB",
              "value": "typeorm:mongodb",
            },
            Object {
              "name": "SQL.js",
              "value": "typeorm:sqljs",
            },
            Object {
              "name": "ReactNative",
              "value": "typeorm:reactnative",
            },
            Object {
              "name": "Expo",
              "value": "typeorm:expo",
            },
          ],
          "message": "Which TypeORM you want to install?",
          "name": "featuresTypeORM",
          "type": "list",
          "when": [Function],
        },
        Object {
          "choices": Array [
            Object {
              "devDependencies": Object {
                "@tsed/cli-plugin-jest": "{{cliVersion}}",
              },
              "name": "Jest",
              "value": "jest",
            },
            Object {
              "devDependencies": Object {
                "@tsed/cli-plugin-mocha": "{{cliVersion}}",
              },
              "name": "Mocha + Chai + Sinon",
              "value": "mocha",
            },
          ],
          "message": "Choose unit framework",
          "name": "featuresTesting",
          "type": "list",
          "when": [Function],
        },
        Object {
          "choices": Array [
            Object {
              "checked": true,
              "devDependencies": Object {
                "@tsed/cli-plugin-eslint": "{{cliVersion}}",
              },
              "name": "EsLint",
              "value": "eslint",
            },
          ],
          "message": "Choose linter tools framework",
          "name": "featuresLinter",
          "type": "list",
          "when": [Function],
        },
        Object {
          "choices": Array [
            Object {
              "name": "Prettier",
              "value": "prettier",
            },
            Object {
              "name": "Lint on commit",
              "value": "lintstaged",
            },
          ],
          "message": "Choose extra linter tools",
          "name": "featuresExtraLinter",
          "type": "checkbox",
          "when": [Function],
        },
        Object {
          "choices": Array [
            Object {
              "devDependencies": Object {
                "@babel/cli": "latest",
                "@babel/core": "latest",
                "@babel/node": "latest",
                "@babel/plugin-proposal-class-properties": "latest",
                "@babel/plugin-proposal-decorators": "latest",
                "@babel/preset-env": "latest",
                "@babel/preset-typescript": "latest",
                "babel-plugin-transform-typescript-metadata": "latest",
                "babel-watch": "latest",
              },
              "name": "Babel",
              "value": "babel",
            },
            Object {
              "devDependencies": Object {
                "@babel/cli": "latest",
                "@babel/core": "latest",
                "@babel/node": "latest",
                "@babel/plugin-proposal-class-properties": "latest",
                "@babel/plugin-proposal-decorators": "latest",
                "@babel/preset-env": "latest",
                "@babel/preset-typescript": "latest",
                "babel-loader": "latest",
                "babel-plugin-transform-typescript-metadata": "latest",
                "babel-watch": "latest",
                "webpack": "latest",
                "webpack-cli": "latest",
              },
              "name": "Webpack",
              "value": "babel:webpack",
            },
          ],
          "message": "Choose your bundler",
          "name": "featuresBundler",
          "type": "list",
          "when": [Function],
        },
        Object {
          "default": "/oidc",
          "message": "Choose the OIDC base path server",
          "name": "oidcBasePath",
          "type": "input",
          "when": [Function],
        },
        Object {
          "choices": Array [
            Object {
              "checked": true,
              "name": "Yarn",
              "value": "yarn",
            },
            Object {
              "checked": false,
              "name": "NPM",
              "value": "npm",
            },
            Object {
              "checked": false,
              "name": "PNPM - experimental",
              "value": "pnpm",
            },
          ],
          "message": "Choose the package manager:",
          "name": "packageManager",
          "type": "list",
        },
      ]
    `);
  });
});
