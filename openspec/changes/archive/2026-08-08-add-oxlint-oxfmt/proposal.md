## Why

The init command currently offers only ESLint and makes Prettier an independent extra. Projects that prefer the OXC toolchain cannot generate an equivalent linting and formatting setup, and the formatter choices are not contextual to the selected linter.

## What Changes

- Add Oxlint as an alternative linter in the interactive and non-interactive init flows.
- Present Prettier as an optional formatter only after selecting ESLint, and Oxfmt only after selecting Oxlint.
- Add an OXC CLI plugin that installs, configures, and runs Oxlint and optional Oxfmt.
- Generate linter-specific lint-staged configuration when commit hooks are selected.
- Preserve the existing ESLint flow and its command-line feature values.

## Capabilities

### New Capabilities

- `oxc-init-toolchain`: Generate a Ts.ED project using Oxlint and optional Oxfmt.
- `contextual-formatter-selection`: Offer formatter choices that are compatible with the selected linter.

### Modified Capabilities

- None.

## Impact

- `packages/cli` feature definitions, prompts, schema, context mapping, and init script composition.
- New `packages/cli-plugin-oxc` workspace containing templates, init hook, and integration tests.
- `packages/cli-plugin-eslint` lint-staged behavior and tests, to retain the ESLint/Prettier pairing.
