import {PackageManager} from "@tsed/cli-core";

import {ArchitectureConvention, PlatformType, ProjectConvention} from "../../../interfaces/index.js";
import {FeatureType} from "./FeaturesPrompt.js";

export const InitFileSchema = {
  type: "object",
  properties: {
    tsedVersion: {
      type: "string"
    },
    projectName: {
      type: "string",
      maxLength: 100
    },
    platform: {
      type: "string",
      description: "The project name. By default, the project is the same as the name directory.",
      enum: Object.values(PlatformType),
      default: PlatformType.EXPRESS
    },
    architecture: {
      type: "string",
      enum: Object.values(ArchitectureConvention),
      default: ArchitectureConvention.DEFAULT
    },
    convention: {
      type: "string",
      enum: Object.values(ProjectConvention),
      default: ProjectConvention.DEFAULT
    },
    features: {
      type: "array",
      items: {
        type: "string",
        enum: Object.values(FeatureType)
      }
    },
    packageManager: {
      type: "string",
      enum: Object.values(PackageManager),
      default: PackageManager.YARN
    },
    skipPrompt: {
      type: "boolean",
      default: false
    }
  },
  required: ["features"],
  additionalProperties: true
};
