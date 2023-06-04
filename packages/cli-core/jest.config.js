// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  ...require("@tsed/jest-config"),
  roots: ["<rootDir>/src", "<rootDir>/test"],
  moduleNameMapper: {
    "@tsed/cli-core": "<rootDir>/src/index.ts"
  },
  coverageThreshold: {
    global: {
      statements: 70.99,
      branches: 72.88,
      functions: 48.71,
      lines: 70.99
    }
  },
};
