import {defineTemplate} from "../utils/defineTemplate.js";
import type {RenderDataContext} from "../interfaces/RenderDataContext.js";

export default defineTemplate({
  id: "tsconfig.spec.json",
  label: "TSConfig spec",
  description: "Create a tsconfig.json file.",
  fileName: "tsconfig.spec",
  outputDir: ".",
  ext: "json",
  preserveCase: true,
  hidden: true,
  render: function (_, context: RenderDataContext) {
    const tsconfig = {
      extends: "./tsconfig.base.json",
      compilerOptions: {
        baseUrl: ".",
        rootDir: ".",
        noEmit: true,
        paths: {
          "@/*": ["src/*"]
        },
        types: ["node"]
      },
      include: ["src/**/*"],
      exclude: ["dist", "coverage", "node_modules"]
    };

    if (context.jest) {
      tsconfig.compilerOptions.types.push("jest");
    }

    if (context.vitest) {
      tsconfig.compilerOptions.types.push("vitest/globals", "vitest/importMeta", "vite/client", "vitest");
      tsconfig.include.push("vitest.config.mts");
    }

    return JSON.stringify(tsconfig, null, 2);
  }
});
