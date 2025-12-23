import {PackageManager, PackageManagersModule} from "@tsed/cli-core";
import {inject} from "@tsed/di";
import {s} from "@tsed/schema";

import {DEFAULT_TSED_TAGS} from "../../../constants/index.js";
import {ArchitectureConvention, PlatformType, ProjectConvention} from "../../../interfaces/index.js";
import type {RuntimeTypes} from "../../../interfaces/RuntimeTypes.js";
import {RuntimesModule} from "../../../runtimes/RuntimesModule.js";
import {FeaturesMap, FeatureType} from "../../init/config/FeaturesPrompt.js";

export const InitSchema = () =>
  s
    .object({
      root: s.string().required().description("Current working directory to initialize Ts.ED project"),
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
                    value: "db:typeorm:mariadb"
                  },
                  {
                    label: "Postgres",
                    value: "db:typeorm:postgres"
                  },
                  {
                    label: "CockRoachDB",
                    value: "db:typeorm:cockroachdb"
                  },
                  {
                    label: "SQLite",
                    value: "db:typeorm:sqlite"
                  },
                  {
                    label: "Better SQLite3",
                    value: "db:typeorm:better-sqlite3"
                  },
                  {
                    label: "Cordova",
                    value: "db:typeorm:cordova"
                  },
                  {
                    label: "NativeScript",
                    value: "db:typeorm:nativescript"
                  },
                  {
                    label: "Oracle",
                    value: "db:typeorm:oracle"
                  },
                  {
                    label: "MsSQL",
                    value: "db:typeorm:mssql"
                  },
                  {
                    label: "MongoDB",
                    value: "db:typeorm:mongodb"
                  },
                  {
                    label: "SQL.js",
                    value: "db:typeorm:sqljs"
                  },
                  {
                    label: "ReactNative",
                    value: "db:typeorm:reactnative"
                  },
                  {
                    label: "Expo",
                    value: "db:typeorm:expo"
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
            value: "linter",
            items: [
              {
                label: "EsLint",
                value: "linter:eslint"
              },
              {
                label: "Prettier",
                value: "linter:prettier"
              },
              {
                label: "Lint on commit",
                value: "linter:lintstaged"
              }
            ]
          },
          {
            label: "OpenID Connect provider",
            value: "oidc",
            items: []
          },
          {
            label: "Passport.js",
            value: "passportjs",
            items: []
          },
          {
            label: "Socket.io",
            value: "socketio",
            items: []
          },
          {
            label: "Testing",
            value: "testing",
            items: [
              {
                label: "Vitest",
                value: "testing:vitest"
              },
              {
                label: "Jest (unstable with ESM)",
                value: "testing:jest"
              }
            ]
          }
        ])
        .opt("--features <features...>"),
      runtime: s
        .enums<RuntimeTypes[]>(inject(RuntimesModule).list() as any[])
        .default("node")
        .description("Runtime (node, bun, ...).")
        .opt("--runtime <runtime>"),
      packageManager: s
        .enums<PackageManager[]>(inject(PackageManagersModule).list() as any[])
        .default(PackageManager.NPM)
        .choices([
          {
            label: FeaturesMap[PackageManager.NPM]!.name,
            value: PackageManager.NPM
          },
          {
            label: FeaturesMap[PackageManager.YARN_BERRY]!.name,
            value: PackageManager.YARN_BERRY
          },
          {
            label: FeaturesMap[PackageManager.PNPM]!.name,
            value: PackageManager.PNPM
          }
        ])
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

// export type InitOptions = s.infer<ReturnType<typeof InitSchema>>;
