import "../src/index.js";

import {InitCmd, TEMPLATE_DIR} from "@tsed/cli";
import {CliPlatformTest, FakeCliExeca, FakeCliFs} from "@tsed/cli-testing";

describe("Eslint: Init cmd", () => {
  beforeEach(() => {
    return CliPlatformTest.bootstrap({
      templateDir: TEMPLATE_DIR,
      commands: [InitCmd],
      argv: ["init"]
    });
  });
  afterEach(() => CliPlatformTest.reset());

  it("should generate a project with the right options", async () => {
    CliPlatformTest.setPackageJson({
      name: "",
      version: "1.0.0",
      description: "",
      scripts: {},
      dependencies: {},
      devDependencies: {}
    });

    await CliPlatformTest.initProject({
      eslint: true,
      lintstaged: true,
      prettier: true
    });

    expect(FakeCliFs.getKeys()).toMatchInlineSnapshot(`
      [
        "project-name",
        "project-name/.barrels.json",
        "project-name/.dockerignore",
        "project-name/.gitignore",
        "project-name/.husky",
        "project-name/.husky/.gitignore",
        "project-name/.husky/_",
        "project-name/.husky/_/.gitignore",
        "project-name/.husky/_/husky.sh",
        "project-name/.husky/post-commit",
        "project-name/.husky/pre-commit",
        "project-name/.lintstagedrc.json",
        "project-name/.prettierignore",
        "project-name/.prettierrc",
        "project-name/.swcrc",
        "project-name/AGENTS.md",
        "project-name/Dockerfile",
        "project-name/README.md",
        "project-name/docker-compose.yml",
        "project-name/eslint.config.mjs",
        "project-name/nodemon.json",
        "project-name/package.json",
        "project-name/processes.config.cjs",
        "project-name/src/Server.ts",
        "project-name/src/config/config.ts",
        "project-name/src/config/logger/index.ts",
        "project-name/src/config/utils/index.ts",
        "project-name/src/controllers/rest/HelloWorldController.ts",
        "project-name/src/index.ts",
        "project-name/tsconfig.base.json",
        "project-name/tsconfig.json",
        "project-name/tsconfig.node.json",
        "project-name/tsconfig.spec.json",
        "project-name/views",
        "project-name/views/home.ejs",
      ]
    `);

    expect([...FakeCliExeca.entries.keys()]).toMatchInlineSnapshot(`
      [
        "yarn install",
        "yarn add --ignore-engines @tsed/logger @tsed/logger-std @tsed/engines @tsed/barrels ajv cross-env @swc/core @swc/cli @swc/helpers @swc-node/register typescript body-parser cors compression cookie-parser express method-override",
        "yarn add -D --ignore-engines @types/node @types/multer tslib nodemon @types/cors @types/express @types/compression @types/cookie-parser @types/method-override",
      ]
    `);

    const content = FakeCliFs.files.get("project-name/eslint.config.mjs")!;

    expect(content).toMatchInlineSnapshot(`
      "import {join} from "node:path";
      import typescriptEslint from "@typescript-eslint/eslint-plugin";
      import typescriptParser from "@typescript-eslint/parser";
      import pluginPrettierRecommended from "eslint-plugin-prettier/recommended";
      import pluginSimpleImportSort from "eslint-plugin-simple-import-sort";
      import globals from "globals";

      export default [
        {
          ignores: ["coverage", "dist", "processes.config.js", "**/templates"]
        },
        {
          files: ["**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}"],
          languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            parser: typescriptParser,
            parserOptions: {
              ecmaVersion: "latest",
              sourceType: "module",
              tsconfigRootDir: join(import.meta.dirname, "tsconfig.eslint.json")
            },
            globals: {
              ...globals.node
            }
          },
          plugins: {
            "@typescript-eslint": typescriptEslint
          },
          rules: {
            "@typescript-eslint/ban-ts-comment": 0,
            "@typescript-eslint/camelcase": 0,
            "@typescript-eslint/no-inferrable-types": 0,
            "@typescript-eslint/explicit-function-return-type": 0,
            "@typescript-eslint/explicit-module-boundary-types": 0,
            "@typescript-eslint/no-unused-vars": 0,
            "@typescript-eslint/no-explicit-any": 0,
            "@typescript-eslint/no-non-null-assertion": 0
          }
        },
        {
          files: ["**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}"],
          languageOptions: {
            parserOptions: {}
          },
          plugins: {
            "simple-import-sort": pluginSimpleImportSort
          },
          rules: {
            "simple-import-sort/imports": "error",
            "simple-import-sort/exports": "error"
          }
        },
        pluginPrettierRecommended
      ];
      "
    `);
  });
  it("should generate a project with the right options + vitest", async () => {
    CliPlatformTest.setPackageJson({
      name: "",
      version: "1.0.0",
      description: "",
      scripts: {},
      dependencies: {},
      devDependencies: {}
    });

    await CliPlatformTest.initProject({
      eslint: true,
      prettier: true,
      vitest: true
    });

    expect(FakeCliFs.getKeys()).toMatchInlineSnapshot(`
      [
        "project-name",
        "project-name/.barrels.json",
        "project-name/.dockerignore",
        "project-name/.gitignore",
        "project-name/.prettierignore",
        "project-name/.prettierrc",
        "project-name/.swcrc",
        "project-name/AGENTS.md",
        "project-name/Dockerfile",
        "project-name/README.md",
        "project-name/docker-compose.yml",
        "project-name/eslint.config.mjs",
        "project-name/nodemon.json",
        "project-name/package.json",
        "project-name/processes.config.cjs",
        "project-name/src/Server.ts",
        "project-name/src/config/config.ts",
        "project-name/src/config/logger/index.ts",
        "project-name/src/config/utils/index.ts",
        "project-name/src/controllers/rest/HelloWorldController.ts",
        "project-name/src/index.ts",
        "project-name/tsconfig.base.json",
        "project-name/tsconfig.json",
        "project-name/tsconfig.node.json",
        "project-name/tsconfig.spec.json",
        "project-name/views",
        "project-name/views/home.ejs",
      ]
    `);

    expect([...FakeCliExeca.entries.keys()]).toMatchInlineSnapshot(`
      [
        "yarn install",
        "yarn add --ignore-engines @tsed/logger @tsed/logger-std @tsed/engines @tsed/barrels ajv cross-env @swc/core @swc/cli @swc/helpers @swc-node/register typescript body-parser cors compression cookie-parser express method-override",
        "yarn add -D --ignore-engines @types/node @types/multer tslib nodemon @types/cors @types/express @types/compression @types/cookie-parser @types/method-override",
      ]
    `);

    const content = FakeCliFs.files.get("project-name/eslint.config.mjs")!;

    expect(content).toMatchInlineSnapshot(`
      "import {join} from "node:path";
      import typescriptEslint from "@typescript-eslint/eslint-plugin";
      import typescriptParser from "@typescript-eslint/parser";
      import pluginPrettierRecommended from "eslint-plugin-prettier/recommended";
      import pluginSimpleImportSort from "eslint-plugin-simple-import-sort";
      import vitest from "eslint-plugin-vitest";
      import globals from "globals";

      export default [
        {
          ignores: ["coverage", "dist", "processes.config.js", "**/templates"]
        },
        {
          files: ["**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}"],
          languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            parser: typescriptParser,
            parserOptions: {
              ecmaVersion: "latest",
              sourceType: "module",
              tsconfigRootDir: join(import.meta.dirname, "tsconfig.eslint.json")
            },
            globals: {
              ...globals.node
            }
          },
          plugins: {
            "@typescript-eslint": typescriptEslint
          },
          rules: {
            "@typescript-eslint/ban-ts-comment": 0,
            "@typescript-eslint/camelcase": 0,
            "@typescript-eslint/no-inferrable-types": 0,
            "@typescript-eslint/explicit-function-return-type": 0,
            "@typescript-eslint/explicit-module-boundary-types": 0,
            "@typescript-eslint/no-unused-vars": 0,
            "@typescript-eslint/no-explicit-any": 0,
            "@typescript-eslint/no-non-null-assertion": 0
          }
        },
        {
          files: ["**/*.spec.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}"], // or any other pattern
          plugins: {
            vitest
          },
          rules: {
            ...vitest.configs.recommended.rules, // you can also use vitest.configs.all.rules to enable all rules
            "vitest/consistent-test-it": ["error", {fn: "it", withinDescribe: "it"}],
            "vitest/no-alias-methods": "error"
          }
        },
        {
          files: ["**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}"],
          languageOptions: {
            parserOptions: {}
          },
          plugins: {
            "simple-import-sort": pluginSimpleImportSort
          },
          rules: {
            "simple-import-sort/imports": "error",
            "simple-import-sort/exports": "error"
          }
        },
        pluginPrettierRecommended
      ];
      "
    `);
  });
});
