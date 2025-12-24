export enum PackageManager {
  YARN = "yarn",
  YARN_BERRY = "yarn_berry",
  NPM = "npm",
  PNPM = "pnpm",
  BUN = "bun"
}

declare global {
  namespace TsED {
    interface ProjectPreferences {
      packageManager: PackageManager;
    }
  }
}

export interface ProjectPreferences extends TsED.ProjectPreferences, Record<string, any> {}
