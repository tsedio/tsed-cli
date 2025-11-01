import swc from "unplugin-swc";
import {defineConfig} from "vitest/config";

import {resolveWorkspaceFiles} from "../plugins/resolveWorkspaceFiles.js";
import {alias} from "./alias.js";

export const presets = defineConfig({
  resolve: {
    alias
  },
  test: {
    globals: true,
    environment: "node",
    exclude: ["**/templates/**", "**/.tmp/**", "**/node_modules/**"],
    coverage: {
      enabled: true,
      provider: "v8",
      reporter: ["text", "json", "html"],
      all: true,
      include: ["src/**/*.{tsx,ts}"],
      exclude: [
        "**/*.spec.{ts,tsx}",
        "**/*.stories.{ts,tsx}",
        "**/*.d.ts",
        "**/__mocks__/**",
        "**/__fixtures__/**",
        "**/__mock__/**",
        "**/tests/**",
        "**/interfaces/**",
        "**/index.ts",
        "**/node_modules/**"
      ]
    }
  },
  plugins: [
    resolveWorkspaceFiles(),
    swc.vite({
      //tsconfigFile: "./tsconfig.spec.json",
      // Explicitly set the module type to avoid inheriting this value from a `.swcrc` config file
      jsc: {
        parser: {
          syntax: "typescript",
          decorators: true,
          dynamicImport: true,
          tsx: true
        },
        target: "esnext",
        externalHelpers: true,
        keepClassNames: true,
        transform: {
          useDefineForClassFields: false,
          legacyDecorator: true,
          decoratorMetadata: true
        }
      },
      module: {
        type: "es6"
      }
    })
  ]
});
