## Context

`InitCmd` aggregates all prompt fields beginning with `features` and maps each selected feature to boolean context flags. The ESLint plugin is loaded through the generated project's dev dependencies and contributes files, scripts, dependencies, and post-install tasks through init hooks. Its lint-staged template currently assumes both ESLint and Prettier are available.

The change adds a second toolchain while preserving ESLint feature compatibility and keeping formatter selection explicit.

## Goals / Non-Goals

**Goals:**

- Let users select exactly one linter: ESLint or Oxlint.
- Offer only the compatible formatter: optional Prettier after ESLint, optional Oxfmt after Oxlint.
- Generate only the selected toolchain's dependencies, configuration, scripts, and lint-staged commands.
- Keep non-interactive feature selection supported.

**Non-Goals:**

- Migrate existing generated projects from ESLint/Prettier to OXC.
- Reproduce every ESLint rule or add Oxlint type-aware linting by default.
- Add Oxfmt as a formatter for ESLint projects or Prettier for Oxlint projects.

## Decisions

### Represent OXC as an independent CLI plugin

Create `@tsed/cli-plugin-oxc` beside `@tsed/cli-plugin-eslint`. Selecting `linter:oxlint` adds this package to generated-project dev dependencies, which makes its hook available during initialization.

This keeps each plugin's dependency graph and templates isolated. Extending `cli-plugin-eslint` would make a package named for ESLint own unrelated OXC behavior and would couple its release and tests to both toolchains.

### Use conditional formatter prompts

Add `linter:oxlint` and `linter:oxfmt` feature values. Keep the linter prompt as a list with ESLint and Oxlint. Use two formatter checkbox prompts with distinct field names and mutually exclusive `when` predicates: one for Prettier when `featuresLinter` is ESLint and one for Oxfmt when it is Oxlint. The existing feature aggregator already combines all `features*` fields.

This avoids unsupported dynamic prompt choices and ensures the UI never displays an incompatible formatter. Command-line users may still provide explicit feature values; hooks only act when their own linter flag is present.

### Generate JSON OXC configuration

The OXC plugin generates `.oxlintrc.json` and, when selected, `.oxfmtrc.json`. JSON supports the local OXC binaries without imposing a Node runtime capable of loading TypeScript configuration files. The templates include the generated project's ignores and preserve the repository's two-space, double-quote, semicolon style.

Oxlint is added as a dev dependency. Oxfmt is added only when `oxfmt` is selected. The generated scripts are `test:lint`, `test:lint:fix`, `test:format`, and `test:format:fix`; the init command composes the lint and formatting checks into the project `test` script whenever either linter is selected.

### Keep lint-staged toolchain-specific

The ESLint hook continues to generate its existing Prettier files only when Prettier is selected. A new OXC template provides Oxlint and optional Oxfmt commands. Both plugins provide Husky and lint-staged dependencies only when `lintstaged` is selected.

## Risks / Trade-offs

- [Direct feature lists can include both linters] → Interactive selection prevents this; hooks remain scoped to their flags, and documentation will present the two alternatives.
- [Oxfmt behavior differs from Prettier in edge cases] → Keep Oxfmt opt-in and use its supported JSON configuration rather than claiming configuration equivalence.
- [Changing test script composition could alter existing projects] → Retain ESLint behavior and only append a formatting check for the OXC path.

## Migration Plan

The release only affects newly generated projects. Existing projects retain their installed plugin and generated configuration. No data or configuration migration is required; rollback consists of removing the new plugin and feature values from a subsequent release.

## Open Questions

- None for the initial implementation; Oxlint type-aware rules and shared OXC presets can be considered in a future change.
