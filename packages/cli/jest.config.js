// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  ...require("@tsed/jest-config"),
  roots: ["<rootDir>/src", "<rootDir>/test"],

  coverageThreshold: {
    global: {
      statements: 92.99,
      branches: 80.73,
      functions: 83.47,
      lines: 92.99
    }
  }
};
