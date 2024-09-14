import {PackageManager} from "@tsed/cli-core";

import {ArchitectureConvention, PlatformType, ProjectConvention} from "../../../interfaces";

export interface InitPromptAnswers {
  projectName: string;
  platform: PlatformType;
  architecture: ArchitectureConvention;
  convention: ProjectConvention;
  features: string[];
  featuresDB: string[];
  featuresTypeORM: string;
  featuresTesting: string;
  featuresExtraLinter: string[];
  featuresBundler: string;
  oidcBasePath: string;
  packageManager: PackageManager;
}
