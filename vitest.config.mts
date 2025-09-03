import {defineConfig} from "vitest/config";

export default defineConfig({
  test: {
    testTimeout: 20000,
    maxConcurrency: 4,
    maxWorkers: 2,
    projects: [
      "packages/**/vitest.config.{mts,ts}"
    ],
  }
})
