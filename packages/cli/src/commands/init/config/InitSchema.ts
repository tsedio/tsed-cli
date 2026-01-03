import {PackageManager, PackageManagersModule} from "@tsed/cli-core";
import {inject} from "@tsed/di";
import {s} from "@tsed/schema";

import {DEFAULT_TSED_TAGS} from "../../../constants/index.js";
import {ArchitectureConvention, PlatformType, ProjectConvention} from "../../../interfaces/index.js";
import type {RuntimeTypes} from "../../../interfaces/RuntimeTypes.js";
import {RuntimesModule} from "../../../runtimes/RuntimesModule.js";
import {FeatureType} from "../../init/config/FeaturesPrompt.js";

export const InitSchema = () => {
  const availablePackageManagers = inject(PackageManagersModule).list();
  const availableRuntimes = inject(RuntimesModule).list();
  return s
    .object({
      root: s.string().description("Current working directory to initialize Ts.ED project").default("."),
      projectName: s
        .string()
        .optional()
        .prompt("What is your project name")
        .when((ctx) => ctx.root !== ".")
        .description("Set the project name. By default, the project is the same as the name directory.")
        .opt("-n, --project-name <projectName>"),
      platform: s
        .enums(PlatformType)
        .default(PlatformType.EXPRESS)
        .prompt("Choose the target Framework:")
        .choices([
          {
            label: "Express.js",
            value: PlatformType.EXPRESS,
            checked: (options: any) => options.platform === PlatformType.EXPRESS || !options.platform // todo maybe it can be infered by default() and item value()
          },
          {
            label: "Koa.js",
            value: PlatformType.KOA,
            checked: (options: any) => options.platform === PlatformType.KOA || !options.platform
          },
          {
            label: "Fastify.js (beta)",
            value: PlatformType.KOA,
            checked: (options: any) => options.platform === PlatformType.KOA || !options.platform
          }
        ])
        .description("Set the default platform for Ts.ED (Express.js, Koa.js or Fastify.js)")
        .opt("-p, --platform <platform>"),
      architecture: s
        .string()
        .enum(ArchitectureConvention)
        .default(ArchitectureConvention.DEFAULT)
        .prompt("Choose the architecture for your project:")
        .description("Architecture convention for tree directory")
        .choices([
          {
            label: "Ts.ED",
            value: ArchitectureConvention.DEFAULT
          },
          {
            label: "Feature",
            value: ArchitectureConvention.FEATURE
          }
        ])
        .opt("-a, --arch <architecture>"),
      convention: s
        .enums(ProjectConvention)
        .default(ProjectConvention.DEFAULT)
        .prompt("Choose the file naming convention:")
        .description("Set the default file naming convention (Ts.ED, Angular).")
        .choices([
          {
            label: "Ts.ED",
            value: ProjectConvention.DEFAULT
          },
          {
            label: "Angular",
            value: ProjectConvention.ANGULAR
          }
        ])
        .opt("-c, --convention <convention>"),
      features: s
        .array()
        .items(s.enums(FeatureType))
        .prompt("Choose the features needed for your project")
        .description("List of features to enable (swagger, graphql, prisma, etc.).")
        .choices([
          {
            label: "Commands",
            value: FeatureType.COMMANDS
          },
          {
            label: "Configuration sources",
            value: FeatureType.CONFIG,
            items: [
              {
                label: "Envs",
                value: FeatureType.CONFIG_ENVS
              },
              {
                label: "Dotenv",
                value: FeatureType.CONFIG_DOTENV
              },
              {
                label: "JSON",
                value: FeatureType.CONFIG_JSON
              },
              {
                label: "YAML",
                value: FeatureType.CONFIG_YAML
              },
              {
                label: "AWS Secrets Manager (Premium)",
                value: FeatureType.CONFIG_AWS_SECRETS
              },
              {
                label: "IORedis (Premium)",
                value: FeatureType.CONFIG_IOREDIS
              },
              {
                label: "MongoDB (Premium)",
                value: FeatureType.CONFIG_MONGO
              },
              {
                label: "Vault (Premium)",
                value: FeatureType.CONFIG_VAULT
              },
              {
                label: "Postgres (Premium)",
                value: FeatureType.CONFIG_POSTGRES
              }
            ]
          },
          {
            label: "ORM",
            value: FeatureType.ORM,
            items: [
              {
                label: "Prisma",
                value: FeatureType.PRISMA
              },
              {
                label: "Mongoose",
                value: FeatureType.MONGOOSE
              },
              {
                label: "TypeORM",
                value: FeatureType.TYPEORM,
                items: [
                  {
                    label: "MySQL",
                    value: FeatureType.TYPEORM_MYSQL
                  },
                  {
                    label: "MariaDB",
                    value: FeatureType.TYPEORM_MARIADB
                  },
                  {
                    label: "Postgres",
                    value: FeatureType.TYPEORM_POSTGRES
                  },
                  {
                    label: "CockRoachDB",
                    value: FeatureType.TYPEORM_COCKROACHDB
                  },
                  {
                    label: "SQLite",
                    value: FeatureType.TYPEORM_SQLITE
                  },
                  {
                    label: "Better SQLite3",
                    value: FeatureType.TYPEORM_BETTER_SQLITE3
                  },
                  {
                    label: "Cordova",
                    value: FeatureType.TYPEORM_CORDOVA
                  },
                  {
                    label: "NativeScript",
                    value: FeatureType.TYPEORM_NATIVESCRIPT
                  },
                  {
                    label: "Oracle",
                    value: FeatureType.TYPEORM_ORACLE
                  },
                  {
                    label: "MsSQL",
                    value: FeatureType.TYPEORM_MSSQL
                  },
                  {
                    label: "MongoDB",
                    value: FeatureType.TYPEORM_MONGODB
                  },
                  {
                    label: "SQL.js",
                    value: FeatureType.TYPEORM_SQLJS
                  },
                  {
                    label: "ReactNative",
                    value: FeatureType.TYPEORM_REACTNATIVE
                  },
                  {
                    label: "Expo",
                    value: FeatureType.TYPEORM_EXPO
                  }
                ]
              }
            ]
          },
          {
            label: "Documentation",
            value: "doc",
            items: [
              {
                label: "Swagger",
                value: "doc:swagger"
              },
              {
                label: "Scalar",
                value: "doc:scalar"
              }
            ]
          },
          {
            label: "TypeGraphQL",
            value: "graphql",
            items: []
          },
          {
            label: "Linter",
            value: FeatureType.LINTER,
            items: [
              {
                label: "EsLint",
                value: FeatureType.ESLINT
              },
              {
                label: "Prettier",
                value: FeatureType.PRETTIER
              },
              {
                label: "Lint on commit",
                value: FeatureType.LINT_STAGED
              }
            ]
          },
          {
            label: "OpenID Connect provider",
            value: FeatureType.OIDC,
            items: []
          },
          {
            label: "Passport.js",
            value: FeatureType.PASSPORTJS,
            items: []
          },
          {
            label: "Socket.io",
            value: FeatureType.SOCKETIO,
            items: []
          },
          {
            label: "Testing",
            value: FeatureType.TESTING,
            items: [
              {
                label: "Vitest",
                value: FeatureType.VITEST
              },
              {
                label: "Jest (unstable with ESM)",
                value: FeatureType.JEST
              }
            ]
          }
        ])
        .opt("--features <features...>"),
      runtime: s
        .enums<RuntimeTypes[]>(availableRuntimes as any[])
        .prompt("Choose the runtime:")
        .choices(
          [
            {
              label: "Node.js + SWC",
              value: "node"
            },
            {
              label: "Node.js + Babel",
              value: "babel"
            },
            {
              label: "Node.js + Webpack",
              value: "webpack"
            },
            {
              label: "Bun",
              value: "bun"
            }
          ].filter((o) => availableRuntimes.includes(o.value))
        )
        .default("node")
        .description("Runtime (node, bun, ...).")
        .opt("--runtime <runtime>"),
      packageManager: s
        .enums<PackageManager[]>(availablePackageManagers as any[])
        .prompt("Choose the package manager:")
        .when((answers) => answers.runtime !== "bun")
        .default(PackageManager.NPM)
        .choices(
          [
            {
              label: "NPM",
              value: PackageManager.NPM
            },
            {
              label: "Yarn Berry",
              value: PackageManager.YARN_BERRY
            },
            {
              label: "PNPM",
              value: PackageManager.PNPM
            },
            {
              label: "Bun.js",
              value: PackageManager.BUN
            }
          ].filter((o) => availablePackageManagers.includes(o.value))
        )
        .description("Package manager (npm, pnpm, yarn, bun).")
        .opt("-m, --package-manager <packageManager>"),
      GH_TOKEN: s
        .string()
        .optional()
        .description(
          "GitHub token to install premium plugins. For example config:aws_secrets:premium or all features endings by `:premium` needs a GH_TOKEN"
        )
        .opt("--gh-token <ghToken>"),
      tsedVersion: s
        .string()
        .optional()
        .default(DEFAULT_TSED_TAGS)
        .description("Use a specific version of Ts.ED (format: x.x.x).")
        .opt("-t, --tsed-version <version>"),
      file: s.string().optional().description("Location of a file in which the features are defined.").opt("-f, --file <file>"),
      skipPrompt: s.boolean().optional().default(false).description("Skip the prompt installation").opt("-s, --skip-prompt")
    })
    .unknown();
};
