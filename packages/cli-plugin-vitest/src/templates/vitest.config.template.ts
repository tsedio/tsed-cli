import {defineTemplate} from "@tsed/cli";

export default defineTemplate({
  id: "vitest.config",
  label: "Vitest configuration",
  fileName: "vitest.config",
  preserveCase: true,
  outputDir: ".",
  hidden: true,

  render() {
    return `import {defineConfig} from "vitest/config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true
  },
  test: {
    globals: true,
    root: "./"
  },
  plugins: []
});`;
  }
});
