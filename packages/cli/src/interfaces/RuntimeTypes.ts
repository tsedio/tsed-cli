export type RuntimeTypes = "node" | "babel" | "swc" | "webpack" | "bun";

declare global {
  namespace TsED {
    interface ProjectPreferences {
      runtime: RuntimeTypes;
    }
  }
}
