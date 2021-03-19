export enum ProjectConvention {
  DEFAULT = "default",
  ANGULAR = "angular"
}

declare global {
  namespace TsED {
    interface ProjectPreferences {
      convention: ProjectConvention;
    }
  }
}
