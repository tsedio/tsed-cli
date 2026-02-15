// @ts-ignore
import {presets} from "@tsed/vitest/presets";
import {defineConfig} from "vitest/config";

export default defineConfig(
  {
    ...presets,
    test: {
      ...presets.test,
      maxWorkers: 3,
      timeout: 20000,
      coverage: {
        ...presets.test?.coverage,
        thresholds: {
          statements: 0,
          branches: 0,
          functions: 0,
          lines: 0
        }
      }
    }
  }
);
