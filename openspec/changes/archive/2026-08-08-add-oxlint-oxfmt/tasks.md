## 1. CLI feature selection

- [x] 1.1 Add Oxlint and Oxfmt feature values and metadata, including the OXC plugin dependency.
- [x] 1.2 Update interactive prompts to select ESLint or Oxlint first, then show their mutually exclusive optional formatter prompts and shared lint-staged prompt.
- [x] 1.3 Update the init schema, context types, and test-script composition for the OXC feature path.
- [x] 1.4 Update prompt and context-mapping tests for both toolchains.

## 2. OXC plugin

- [x] 2.1 Create the `@tsed/cli-plugin-oxc` workspace with module entry point, build configuration, and package metadata.
- [x] 2.2 Implement the OXC init hook to install Oxlint, generate `.oxlintrc.json`, and add lint scripts.
- [x] 2.3 Generate the optional `.oxfmtrc.json` template and add Oxfmt dependencies and format scripts.
- [x] 2.4 Add toolchain-specific Husky and lint-staged templates and post-install tasks.

## 3. Verification

- [x] 3.1 Add OXC integration tests for Oxlint-only and Oxlint/Oxfmt project generation.
- [x] 3.2 Update ESLint integration tests for conditional Prettier and lint-staged behavior.
- [x] 3.3 Run targeted CLI and plugin test suites with the agent reporter.
