import {getFeaturesPrompt} from "./getFeaturesPrompt.js";

describe("getFeaturesPrompt", () => {
  it("should add a provider info", () => {
    const prompt = getFeaturesPrompt(["node", "bun"], ["yarn", "npm", "pnpm", "bun"], {});

    expect(prompt).toBeInstanceOf(Array);
    expect(prompt).toMatchInlineSnapshot(`
      [
        {
          "choices": [
            {
              "checked": true,
              "name": "Express.js",
              "value": "express",
            },
            {
              "checked": false,
              "name": "Koa.js",
              "value": "koa",
            },
          ],
          "message": "Choose the target Framework:",
          "name": "platform",
          "type": "list",
        },
        {
          "choices": [
            {
              "checked": true,
              "name": "Ts.ED",
              "value": "arc_default",
            },
            {
              "checked": false,
              "name": "Feature",
              "value": "feature",
            },
          ],
          "message": "Choose the architecture for your project:",
          "name": "architecture",
          "type": "list",
        },
        {
          "choices": [
            {
              "checked": true,
              "name": "Ts.ED",
              "value": "conv_default",
            },
            {
              "checked": false,
              "name": "Angular",
              "value": "angular",
            },
          ],
          "message": "Choose the convention file styling:",
          "name": "convention",
          "type": "list",
        },
        {
          "choices": [
            {
              "dependencies": {
                "@tsed/typegraphql": "{{tsedVersion}}",
              },
              "devDependencies": {
                "@tsed/cli-plugin-typegraphql": "{{cliVersion}}",
              },
              "name": "TypeGraphQL",
              "value": "graphql",
            },
            {
              "name": "Database",
              "value": "db",
            },
            {
              "devDependencies": {
                "@tsed/cli-plugin-passport": "{{cliVersion}}",
              },
              "name": "Passport.js",
              "value": "passportjs",
              "when": [Function],
            },
            {
              "dependencies": {
                "@tsed/socketio": "{{tsedVersion}}",
                "socket.io": "latest",
              },
              "name": "Socket.io",
              "value": "socketio",
            },
            {
              "dependencies": {
                "@tsed/swagger": "{{tsedVersion}}",
              },
              "name": "Swagger",
              "value": "swagger",
            },
            {
              "devDependencies": {
                "@tsed/cli-plugin-oidc-provider": "{{cliVersion}}",
              },
              "name": "OpenID Connect provider",
              "value": "oidc",
            },
            {
              "dependencies": {},
              "devDependencies": {
                "@types/supertest": "latest",
                "supertest": "latest",
              },
              "name": "Testing",
              "value": "testing",
            },
            {
              "name": "Linter",
              "value": "linter",
            },
            {
              "dependencies": {
                "@tsed/cli-core": "{{cliVersion}}",
              },
              "devDependencies": {
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
        {
          "choices": [
            {
              "devDependencies": {
                "@tsed/cli-plugin-prisma": "{{cliVersion}}",
              },
              "name": "Prisma",
              "value": "prisma",
            },
            {
              "devDependencies": {
                "@tsed/cli-plugin-mongoose": "{{cliVersion}}",
              },
              "name": "Mongoose",
              "value": "mongoose",
            },
            {
              "devDependencies": {
                "@tsed/cli-plugin-typeorm": "{{cliVersion}}",
                "typeorm": "latest",
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
        {
          "choices": [
            {
              "dependencies": {
                "mysql2": "latest",
              },
              "name": "MySQL",
              "value": "typeorm:mysql",
            },
            {
              "dependencies": {
                "mariadb": "latest",
              },
              "name": "MariaDB",
              "value": "typeorm:mariadb",
            },
            {
              "dependencies": {
                "pg": "latest",
              },
              "name": "Postgres",
              "value": "typeorm:postgres",
            },
            {
              "dependencies": {
                "cockroachdb": "latest",
              },
              "name": "CockRoachDB",
              "value": "typeorm:cockroachdb",
            },
            {
              "dependencies": {
                "sqlite3": "latest",
              },
              "name": "SQLite",
              "value": "typeorm:sqlite",
            },
            {
              "dependencies": {
                "better-sqlite3": "latest",
              },
              "name": "Better SQLite3",
              "value": "typeorm:better-sqlite3",
            },
            {
              "name": "Cordova",
              "value": "typeorm:cordova",
            },
            {
              "name": "NativeScript",
              "value": "typeorm:nativescript",
            },
            {
              "dependencies": {
                "oracledb": "latest",
              },
              "name": "Oracle",
              "value": "typeorm:oracle",
            },
            {
              "dependencies": {
                "mssql": "latest",
              },
              "name": "MsSQL",
              "value": "typeorm:mssql",
            },
            {
              "dependencies": {
                "mongodb": "latest",
              },
              "name": "MongoDB",
              "value": "typeorm:mongodb",
            },
            {
              "name": "SQL.js",
              "value": "typeorm:sqljs",
            },
            {
              "name": "ReactNative",
              "value": "typeorm:reactnative",
            },
            {
              "name": "Expo",
              "value": "typeorm:expo",
            },
          ],
          "message": "Which TypeORM you want to install?",
          "name": "featuresTypeORM",
          "type": "list",
          "when": [Function],
        },
        {
          "choices": [
            {
              "devDependencies": {
                "@tsed/cli-plugin-vitest": "{{cliVersion}}",
              },
              "name": "Vitest",
              "value": "vitest",
            },
            {
              "devDependencies": {
                "@tsed/cli-plugin-jest": "{{cliVersion}}",
              },
              "name": "Jest",
              "value": "jest",
            },
          ],
          "message": "Choose unit framework",
          "name": "featuresTesting",
          "type": "list",
          "when": [Function],
        },
        {
          "choices": [
            {
              "checked": true,
              "devDependencies": {
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
        {
          "choices": [
            {
              "name": "Prettier",
              "value": "prettier",
            },
            {
              "name": "Lint on commit",
              "value": "lintstaged",
            },
          ],
          "message": "Choose extra linter tools",
          "name": "featuresExtraLinter",
          "type": "checkbox",
          "when": [Function],
        },
        {
          "default": "/oidc",
          "message": "Choose the OIDC base path server",
          "name": "oidcBasePath",
          "type": "input",
          "when": [Function],
        },
        {
          "choices": [
            {
              "checked": true,
              "name": "Node.js",
              "value": "node",
            },
            {
              "checked": false,
              "name": "Bun.js (experimental)",
              "value": "bun",
            },
          ],
          "message": "Choose the runtime:",
          "name": "runtime",
          "type": "list",
        },
        {
          "choices": [
            {
              "checked": true,
              "name": "Yarn",
              "value": "yarn",
            },
            {
              "checked": false,
              "name": "NPM",
              "value": "npm",
            },
            {
              "checked": false,
              "name": "PNPM (experimental)",
              "value": "pnpm",
            },
            {
              "checked": false,
              "name": "Bun.js (experimental)",
              "value": "bun",
            },
          ],
          "message": "Choose the package manager:",
          "name": "packageManager",
          "type": "list",
          "when": [Function],
        },
      ]
    `);
  });
});
