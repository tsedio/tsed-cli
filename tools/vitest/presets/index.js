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
  plugins: [resolveWorkspaceFiles()]
});
