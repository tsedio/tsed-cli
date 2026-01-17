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
            {
              "checked": false,
              "name": "Fastify.js (beta)",
              "value": "fastify",
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
                "@tsed/cli-core": "{{cliVersion}}",
              },
              "name": "Commands",
              "value": "commands",
            },
            {
              "dependencies": {
                "@tsed/config": "{{tsedVersion}}",
              },
              "name": "Configuration sources",
              "value": "config",
            },
            {
              "name": "Documentation",
              "value": "doc",
            },
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
              "name": "Linter",
              "value": "linter",
            },
            {
              "devDependencies": {
                "@tsed/cli-plugin-oidc-provider": "{{cliVersion}}",
              },
              "name": "OpenID Connect provider",
              "value": "oidc",
            },
            {
              "name": "Database",
              "value": "orm",
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
              "dependencies": {},
              "devDependencies": {
                "@types/supertest": "latest",
                "supertest": "latest",
              },
              "name": "Testing",
              "value": "testing",
            },
          ],
          "message": "Choose the features needed for your project",
          "name": "features",
          "type": "checkbox",
        },
        {
          "choices": [
            {
              "name": "Envs",
              "value": "config:envs",
            },
            {
              "dependencies": {
                "dotenv": "latest",
                "dotenv-expand": "latest",
                "dotenv-flow": "latest",
              },
              "name": "Dotenv",
              "value": "config:dotenv",
            },
            {
              "name": "JSON",
              "value": "config:json",
            },
            {
              "dependencies": {
                "js-yaml": "latest",
              },
              "name": "YAML",
              "value": "config:yaml",
            },
            {
              "dependencies": {
                "@aws-sdk/client-secrets-manager": "latest",
                "@tsedio/config-source-aws-secrets": "latest",
              },
              "name": "AWS Secrets Manager (Premium)",
              "value": "config:aws_secrets:premium",
            },
            {
              "dependencies": {
                "@tsed/ioredis": "{{tsedVersion}}",
                "@tsedio/config-ioredis": "{{tsedVersion}}",
                "ioredis": "latest",
              },
              "devDependencies": {
                "@tsedio/testcontainers-redis": "latest",
              },
              "name": "IORedis (Premium)",
              "value": "config:ioredis:premium",
            },
            {
              "dependencies": {
                "@tsedio/config-mongo": "latest",
                "mongodb": "latest",
              },
              "name": "MongoDB (Premium)",
              "value": "config:mongo:premium",
            },
            {
              "dependencies": {
                "@tsedio/config-vault": "latest",
                "node-vault": "latest",
              },
              "name": "Vault (Premium)",
              "value": "config:vault:premium",
            },
            {
              "dependencies": {
                "@tsedio/config-postgres": "latest",
                "pg": "latest",
              },
              "name": "Postgres (Premium)",
              "value": "config:postgres:premium",
            },
          ],
          "message": "Choose configuration sources",
          "name": "featuresConfig",
          "type": "checkbox",
          "when": [Function],
        },
        {
          "choices": [
            {
              "dependencies": {
                "@tsed/swagger": "{{tsedVersion}}",
              },
              "name": "Swagger",
              "value": "doc:swagger",
            },
            {
              "dependencies": {
                "@tsed/scalar": "{{tsedVersion}}",
              },
              "name": "Scalar",
              "value": "doc:scalar",
            },
          ],
          "message": "Choose a documentation plugin",
          "name": "featuresDoc",
          "type": "checkbox",
          "when": [Function],
        },
        {
          "choices": [
            {
              "devDependencies": {
                "@tsed/cli-plugin-prisma": "{{cliVersion}}",
              },
              "name": "Prisma",
              "value": "orm:prisma",
            },
            {
              "devDependencies": {
                "@tsed/cli-plugin-mongoose": "{{cliVersion}}",
              },
              "name": "Mongoose",
              "value": "orm:mongoose",
            },
            {
              "devDependencies": {
                "@tsed/cli-plugin-typeorm": "{{cliVersion}}",
                "typeorm": "latest",
              },
              "name": "TypeORM",
              "value": "orm:typeorm",
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
              "value": "orm:typeorm:mysql",
            },
            {
              "dependencies": {
                "mariadb": "latest",
              },
              "name": "MariaDB",
              "value": "orm:typeorm:mariadb",
            },
            {
              "dependencies": {
                "pg": "latest",
              },
              "name": "Postgres",
              "value": "orm:typeorm:postgres",
            },
            {
              "dependencies": {
                "cockroachdb": "latest",
              },
              "name": "CockRoachDB",
              "value": "orm:typeorm:cockroachdb",
            },
            {
              "dependencies": {
                "sqlite3": "latest",
              },
              "name": "SQLite",
              "value": "orm:typeorm:sqlite",
            },
            {
              "dependencies": {
                "better-sqlite3": "latest",
              },
              "name": "Better SQLite3",
              "value": "orm:typeorm:better-sqlite3",
            },
            {
              "name": "Cordova",
              "value": "orm:typeorm:cordova",
            },
            {
              "name": "NativeScript",
              "value": "orm:typeorm:nativescript",
            },
            {
              "dependencies": {
                "oracledb": "latest",
              },
              "name": "Oracle",
              "value": "orm:typeorm:oracle",
            },
            {
              "dependencies": {
                "mssql": "latest",
              },
              "name": "MsSQL",
              "value": "orm:typeorm:mssql",
            },
            {
              "dependencies": {
                "mongodb": "latest",
              },
              "name": "MongoDB",
              "value": "orm:typeorm:mongodb",
            },
            {
              "name": "SQL.js",
              "value": "orm:typeorm:sqljs",
            },
            {
              "name": "ReactNative",
              "value": "orm:typeorm:reactnative",
            },
            {
              "name": "Expo",
              "value": "orm:typeorm:expo",
            },
          ],
          "message": "Which TypeORM you want to install?",
          "name": "featuresTypeORM",
          "type": "list",
          "when": [Function],
        },
        {
          "message": "Enter GH_TOKEN to use the premium @tsedio package or leave blank (see https://tsed.dev/plugins/premium/install-premium-plugins.html)",
          "name": "GH_TOKEN",
          "type": "password",
          "when": [Function],
        },
        {
          "choices": [
            {
              "devDependencies": {
                "@tsed/cli-plugin-vitest": "{{cliVersion}}",
              },
              "name": "Vitest",
              "value": "testing:vitest",
            },
            {
              "devDependencies": {
                "@tsed/cli-plugin-jest": "{{cliVersion}}",
              },
              "name": "Jest (unstable with ESM)",
              "value": "testing:jest",
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
              "value": "linter:eslint",
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
              "value": "linter:prettier",
            },
            {
              "name": "Lint on commit",
              "value": "linter:lintstaged",
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
              "name": "Node.js + SWC",
              "value": "node",
            },
            {
              "checked": false,
              "name": "Bun.js",
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
              "name": "PNPM",
              "value": "pnpm",
            },
            {
              "checked": false,
              "name": "Bun.js",
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
