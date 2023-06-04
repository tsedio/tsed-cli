export enum ArchitectureConvention {
  DEFAULT = "arc_default",
  FEATURE = "feature"
}

declare global {
  namespace TsED {
    interface ProjectPreferences {
      architecture: ArchitectureConvention;
    }
  }
}
