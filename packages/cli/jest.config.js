// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  ...require("@tsed/jest-config"),
  roots: ["<rootDir>/src", "<rootDir>/test"],

  coverageThreshold: {
    global: {
      statements: 91.77,
      branches: 72.61,
      functions: 75.94,
      lines: 91.77
    }
  }
};
