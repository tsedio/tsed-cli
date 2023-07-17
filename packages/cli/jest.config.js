// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  ...require("@tsed/jest-config"),
  roots: ["<rootDir>/src", "<rootDir>/test"],

  coverageThreshold: {
    global: {
      statements: 91.73,
      branches: 79.51,
      functions: 76.25,
      lines: 91.73
    }
  }
};
