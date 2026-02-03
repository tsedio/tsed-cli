module.exports = {
  rootDir: process.cwd(),
  packagesDir: "packages/",
  scanPatterns: [
    "<rootDir>/packages/**/lib/types/**/*.d.ts",
    "!<rootDir>/packages/*/src",
    "!**/*.spec.ts",
    "!**/__mock__/**",
    "!**/data/**",
    "!**/__fixtures__/**",
    "!**/fixtures/**",
    "!**/node_modules"
  ],
  outputDir: "<rootDir>/docs/api",
  baseUrl: "/api",
  jsonOutputDir: "<rootDir>/docs/public",
  templatesDir: "<rootDir>/docs/.templates",
  scope: "@tsed",
  modules: {}
};
