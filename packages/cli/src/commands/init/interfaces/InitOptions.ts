import {PackageManager} from "@tsed/cli-core";

import {ArchitectureConvention} from "../../../interfaces/ArchitectureConvention.js";
import {PlatformType} from "../../../interfaces/PlatformType.js";
import {ProjectConvention} from "../../../interfaces/ProjectConvention.js";
import {FeatureType} from "../config/FeaturesPrompt.js";

export interface InitOptions {
  root: string;
  projectName: string;
  features: FeatureType[];
  skipPrompt: boolean;
  platform: PlatformType;
  tsedVersion: string;
  cliVersion: string;
  architecture: ArchitectureConvention;
  convention: ProjectConvention;
  packageManager: PackageManager;
  runtime: "node" | "babel" | "swc" | "webpack" | "bun";
  oidcBasePath: string;
  file: string;
}
