## ADDED Requirements

### Requirement: Choose one linter before formatter options

The interactive init flow SHALL present ESLint and Oxlint as the choices of a single linter selection prompt.

#### Scenario: Linter prompt displayed

- **WHEN** a user selects the Linter feature during interactive initialization
- **THEN** the CLI presents ESLint and Oxlint as alternative linter choices

### Requirement: Offer Prettier only for ESLint

The interactive init flow SHALL offer Prettier as an optional formatter only after the user selects ESLint.

#### Scenario: ESLint selected

- **WHEN** the user selects ESLint
- **THEN** the CLI displays Prettier as an optional formatter and does not display Oxfmt

### Requirement: Offer Oxfmt only for Oxlint

The interactive init flow SHALL offer Oxfmt as an optional formatter only after the user selects Oxlint.

#### Scenario: Oxlint selected

- **WHEN** the user selects Oxlint
- **THEN** the CLI displays Oxfmt as an optional formatter and does not display Prettier

### Requirement: Preserve independent commit-hook selection

The interactive init flow SHALL offer lint-on-commit independently of the selected linter and formatter.

#### Scenario: Formatter not selected

- **WHEN** a user declines the formatter option for either linter
- **THEN** the user can still select lint on commit
