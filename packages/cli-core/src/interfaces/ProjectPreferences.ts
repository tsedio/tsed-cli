export enum PackageManager {
  YARN = "yarn",
  NPM = "npm"
}

declare global {
  namespace TsED {
    interface ProjectPreferences {
      packageManager: PackageManager;
    }
  }
}

export interface ProjectPreferences extends TsED.ProjectPreferences, Record<string, any> {}
