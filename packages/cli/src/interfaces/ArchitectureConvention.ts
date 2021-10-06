export enum ArchitectureConvention {
  DEFAULT = "default",
  FEATURE = "feature"
}

declare global {
  namespace TsED {
    interface ProjectPreferences {
      architecture: ArchitectureConvention;
    }
  }
}
