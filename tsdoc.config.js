
module.exports = {
  rootDir: process.cwd(),
  packagesDir: "packages/",
  scanPatterns: [
    "<rootDir>/packages/{cli,cli-core}/lib/types/**/*.d.ts",
    "!**/*.spec.ts",
    "!**/node_modules",
    "!**/__mock__/**"
  ],
  outputDir: "<rootDir>/docs/api",
  baseUrl: "/api",
  jsonOutputDir: "<rootDir>/docs/.vuepress/public",
  scope: "@tsed",
  modules: {}
};
