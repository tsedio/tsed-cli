import {defineTemplate} from "@tsed/cli";

export default defineTemplate({
  id: "jest.config",
  label: "Jest Config",
  fileName: "jest.config",
  ext: "mjs",
  outputDir: ".",
  hidden: true,
  preserveCase: true,

  render() {
    return `// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

/** @type {import('jest').Config} */
export default {
  // Automatically clear mock calls and instances between every test
  clearMocks: true,

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,

  // An array of glob patterns indicating a set of files for which coverage information should be collected
  // collectCoverageFrom: undefined,

  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage",

  // An array of regexp pattern strings used to skip coverage collection
  coveragePathIgnorePatterns: ["index.ts", "/node_modules/"],

  // An object that configures minimum threshold enforcement for coverage results
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },

  // An array of file extensions your modules use
  moduleFileExtensions: ["js", "json", "jsx", "ts", "tsx", "node"],
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  // The test environment that will be used for testing
  testEnvironment: "node",

  // The glob patterns Jest uses to detect test files
  testMatch: ["**/src/**/__tests__/**/*.[jt]s?(x)", "**/src/**/?(*.)+(spec|test).[tj]s?(x)"],
  // A map from regular expressions to paths to transformers
  transform: {
    "^.+\\\\.(j|t)sx?$": [
      "@swc/jest",
      {
        jsc: {
          parser: {
            syntax: "typescript",
            tsx: true,
            decorators: true,
            dynamicImport: true,
            importMeta: true,
            preserveAllComments: true
          },
          target: "esnext",
          transform: {
            useDefineForClassFields: false,
            legacyDecorator: true,
            decoratorMetadata: true
          }
        },
        module: {
          type: "es6"
        }
      }
    ]
  },
  moduleNameMapper: {
    "^(\\\\.{1,2}/.*)\\\\.js$": "$1"
  },
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  transformIgnorePatterns: ["/node_modules/(?!(module-name|another-module)/)"]
};
`;
  }
});
