import {PackageManager} from "@tsed/cli-core";
import {s} from "@tsed/schema";

import {PlatformType} from "../../interfaces/PlatformType.js";
import {ProjectConvention} from "../../interfaces/ProjectConvention.js";

export const ProjectPreferenceSchema = s
  .object({
    convention: s.string().enum(ProjectConvention).description("Project convention (Ts.ED or Angular style)"),
    packageManager: s.string().enum(PackageManager).description("Used project manager to install dependencies"),
    runtime: s
      .string()
      .enum("node", "babel", "swc", "webpack", "bun")
      .description("The javascript runtime used to start application (node, node + webpack, node + swc, node + babel, bun)"),
    platform: s.string().enum(PlatformType).description("Node.js framework used to run server (Express, Koa, Fastify)")
  })
  .optional()
  .description("Resolved project preferences");
