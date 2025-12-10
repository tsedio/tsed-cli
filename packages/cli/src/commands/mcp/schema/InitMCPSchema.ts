import {PackageManagersModule} from "@tsed/cli-core";
import {inject} from "@tsed/di";
import {s} from "@tsed/schema";

import {ArchitectureConvention, PlatformType, ProjectConvention} from "../../../interfaces/index.js";
import {RuntimesModule} from "../../../runtimes/RuntimesModule.js";
import {FeatureType} from "../../init/config/FeaturesPrompt.js";

export const InitMCPSchema = () =>
  s.object({
    cwd: s.string().required().description("Current working directory to initialize Ts.ED project"),
    projectName: s.string().description("Project name. Defaults to the current folder name."),
    platform: s.string().enum(PlatformType).default(PlatformType.EXPRESS).description("Target platform (express, koa, fastify)."),
    convention: s
      .string()
      .enum(ProjectConvention)
      .default(ProjectConvention.DEFAULT)
      .description("Project convention (default, nest, etc.)."),
    runtime: s.string().enum(inject(RuntimesModule).list()).default("node").description("Runtime (node, bun, ...)."),
    packageManager: s
      .string()
      .enum(inject(PackageManagersModule).list())
      .default("npm")
      .description("Package manager (npm, pnpm, yarn, bun)."),
    architecture: s
      .string()
      .enum(ArchitectureConvention)
      .default(ArchitectureConvention.DEFAULT)
      .description("Architecture convention (default, feature, ...)."),
    features: s.array().items(s.string().enum(FeatureType)).description("List of features to enable (swagger, graphql, prisma, etc.)."),
    GH_TOKEN: s
      .string()
      .optional()
      .description(
        "GitHub token to install premium plugins. For example config:aws_secrets:premium or all features endings by `:premium` needs a GH_TOKEN"
      )
  });
