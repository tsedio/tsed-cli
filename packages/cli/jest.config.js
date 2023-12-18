// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  ...require("@tsed/jest-config"),
  roots: ["<rootDir>/src", "<rootDir>/test"],

  coverageThreshold: {
    global: {
      statements: 93.13,
      branches: 80.66,
      functions: 82.75,
      lines: 93.13
    }
  }
};
