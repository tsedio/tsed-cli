import {PackageManager} from "@tsed/cli-core";
import {s} from "@tsed/schema";

import {ArchitectureConvention, PlatformType, ProjectConvention} from "../../../interfaces/index.js";
import {FeatureType} from "./FeaturesPrompt.js";

export const InitSchema = s
  .object({
    tsedVersion: s.string().optional().description("The CLI will use the given tsed version to generate the project"),
    projectName: s.string().optional().description("The project name"),
    platform: s
      .string()
      .enum(PlatformType)
      .default(PlatformType.EXPRESS)
      .description("Node.js framework used to run server (Express, Koa, Fastify)"),
    convention: s
      .string()
      .enum(ProjectConvention)
      .default(ProjectConvention.DEFAULT)
      .description("Project convention (Ts.ED or Angular style)"),
    packageManager: s.string().enum(PackageManager).default(PackageManager.NPM).description("Used project manager to install dependencies"),
    runtime: s
      .string()
      .enum("node", "babel", "swc", "webpack", "bun")
      .description("The javascript runtime used to start application (node, node + webpack, node + swc, node + babel, bun)"),
    features: s.array().items(s.string().enum(FeatureType)).required().minItems(1).description("List of feature to create the projet"),
    skipPrompt: s.boolean().default(false).description("Skip the prompt")
  })
  .unknown();
