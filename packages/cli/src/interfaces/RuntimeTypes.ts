export type RuntimeTypes = "node" | "babel" | "swc" | "webpack" | "bun" | "vite" | "bun-vite";

declare global {
  namespace TsED {
    interface ProjectPreferences {
      runtime: RuntimeTypes;
    }
  }
}
