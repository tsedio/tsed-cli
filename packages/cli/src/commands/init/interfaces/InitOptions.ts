import {PackageManager} from "@tsed/cli-core";
import {PlatformType} from "../../../interfaces/PlatformType";
import {ArchitectureConvention} from "../../../interfaces/ArchitectureConvention";
import {ProjectConvention} from "../../../interfaces/ProjectConvention";
import {FeatureType} from "../config/FeaturesPrompt";

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
