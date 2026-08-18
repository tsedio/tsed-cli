## Purpose

Define the Ts.ED CLI support for generating projects with the Oxlint and Oxfmt toolchain.

## Requirements

### Requirement: Generate an Oxlint project

The init command SHALL support the `linter:oxlint` feature and SHALL load an OXC CLI plugin for generated projects that select it.

#### Scenario: Interactive Oxlint selection

- **WHEN** a user selects Oxlint during project initialization
- **THEN** the generated project's development dependencies include the OXC CLI plugin and `oxlint`

#### Scenario: Non-interactive Oxlint selection

- **WHEN** initialization receives `--features linter:oxlint` with prompts skipped
- **THEN** the generated project receives Oxlint configuration and lint scripts

### Requirement: Generate Oxlint configuration and scripts

The OXC CLI plugin SHALL generate `.oxlintrc.json` and SHALL add `test:lint` and `test:lint:fix` scripts that invoke Oxlint.

#### Scenario: Project initialized with Oxlint

- **WHEN** a project is initialized with the Oxlint feature
- **THEN** it contains `.oxlintrc.json`, `test:lint` runs `oxlint`, and `test:lint:fix` runs `oxlint --fix`

### Requirement: Generate optional Oxfmt support

The OXC CLI plugin SHALL add `oxfmt`, `.oxfmtrc.json`, and formatting scripts only when the `linter:oxfmt` feature is selected together with Oxlint.

#### Scenario: Oxfmt selected

- **WHEN** a user initializes a project with `linter:oxlint` and `linter:oxfmt`
- **THEN** the project contains `.oxfmtrc.json` and exposes `test:format` and `test:format:fix` scripts for Oxfmt

#### Scenario: Oxfmt not selected

- **WHEN** a user initializes a project with `linter:oxlint` without `linter:oxfmt`
- **THEN** the project does not install Oxfmt or generate its formatter configuration

### Requirement: Apply selected OXC tools to commit hooks

The OXC CLI plugin SHALL generate Husky and lint-staged assets only when `linter:lintstaged` is selected, and the generated lint-staged configuration SHALL invoke Oxlint and selected Oxfmt commands rather than ESLint or Prettier commands.

#### Scenario: Oxlint with lint-staged

- **WHEN** a user selects Oxlint and lint on commit
- **THEN** staged TypeScript and JavaScript files run `oxlint --fix`

#### Scenario: Oxlint, Oxfmt, and lint-staged

- **WHEN** a user selects Oxlint, Oxfmt, and lint on commit
- **THEN** staged files also run the Oxfmt formatting command
