export enum ProjectConvention {
  DEFAULT = "conv_default",
  ANGULAR = "angular"
}

declare global {
  namespace TsED {
    interface ProjectPreferences {
      convention: ProjectConvention;
    }
  }
}
