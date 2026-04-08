import {builtinModules} from "node:module";

import {defineConfig} from "vite";

export default defineConfig({
  appType: "custom",
  build: {
    outDir: "dist",
    target: "node24",
    ssr: "src/index.ts",
    sourcemap: true,
    minify: false,
    rollupOptions: {
      external: [...builtinModules, ...builtinModules.map((module) => `node:${module}`)],
      output: {
        entryFileNames: "index.js",
        format: "es"
      }
    }
  }
});
