// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  ...require("@tsed/jest-config"),
  coverageThreshold: {
    global: {
      statements: 84.44,
      branches: 50,
      functions: 33.33,
      lines: 84.44
    }
  }
};
