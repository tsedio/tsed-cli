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
      statements: 73.23,
      branches: 70.12,
      functions: 51.97,
      lines: 73.23
    }
  },
};
