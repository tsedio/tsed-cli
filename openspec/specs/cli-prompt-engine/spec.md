# cli-prompt-engine Specification

## Purpose

TBD - created by archiving change replace-inquirer-with-clack. Update Purpose after archive.

## Requirements

### Requirement: CLI prompts run on @clack/prompts

The CLI core SHALL orchestrate `$prompt` questions via `@clack/prompts`, replacing the direct `Inquirer.prompt` usage inside `CliService`.

#### Scenario: Command collects answers with Clack

- **WHEN** a command provider returns a mix of `input`, `list`, and `checkbox` questions
- **THEN** `CliService` asks them through the Clack-backed runner, merges the answers into the command context, and never imports `inquirer` or `inquirer-autocomplete-prompt`.

### Requirement: Prompt engine is abstracted behind Ts.ED APIs

The implementation of the prompt runner MUST live behind a Ts.ED-owned adapter/service so commands and plugins remain decoupled from the specific prompt library.

#### Scenario: Future prompt engines can be swapped

- **WHEN** the project decides to switch from `@clack/prompts` to another library
- **THEN** only the adapter implementation needs to be updated because commands, templates, and plugin prompts depend on the Ts.ED `PromptRunner`/`PromptAdapter` contract rather than the concrete library.

### Requirement: Adapter introduces no regressions while still backed by Inquirer

Before swapping to Clack, the new adapter SHALL proxy the existing Inquirer flows so the migration can ship without breaking command prompts.

#### Scenario: Inquirer-backed adapter maintains behavior

- **WHEN** the adapter is first introduced and still delegates to `Inquirer.prompt`
- **THEN** commands (`init`, `generate`, etc.) behave exactly as before, proving the abstraction is safe prior to toggling the Clack implementation.

### Requirement: Prompt schema remains declarative and backwards-compatible

The CLI SHALL continue accepting the existing question objects (name, message, type, when, default, choices, transformer) so plugin authors do not have to rewrite prompts when upgrading.

#### Scenario: Existing template prompts keep working

- **WHEN** a template's `prompts()` hook (e.g., `cli-plugin-typeorm` datasource template) returns the current `type: "autocomplete"` definition with `when`, `source`, and choice metadata
- **THEN** the new prompt runner evaluates those properties without requiring type changes, and the answers are available to the template just as before.

### Requirement: Async autocomplete prompts must be supported

The prompt engine SHALL provide an async searchable selection equivalent to `inquirer-autocomplete-prompt`, using `@clack/prompts` primitives so commands like `tsed add` and `tsed generate` can filter large lists on the fly.

#### Scenario: Add command searches plugins interactively

- **WHEN** the user runs `tsed add` without a `name` argument and begins typing inside the autocomplete prompt
- **THEN** the CLI calls the supplied `source(answers, keyword)` function as the keyword changes, renders the latest result set via Clack, and resolves with the chosen plugin value.

### Requirement: Documentation and scaffolding reference the new prompt contract

All readmes, templates, and generated files SHALL describe the Clack-based prompt system (and the Ts.ED-owned `QuestionOptions` type) instead of directing users to Inquirer docs or types.

#### Scenario: Command template shows the right imports

- **WHEN** a developer inspects `packages/cli/src/templates/command.template.ts`
- **THEN** the template imports the new `QuestionOptions` type from `@tsed/cli-core`, explains that prompts run on `@clack/prompts`, and no longer mentions Inquirer.

### Requirement: Inquirer dependencies are removed in favor of @clack/prompts

`inquirer`, `inquirer-autocomplete-prompt`, and their type packages SHALL be removed from the monorepo dependencies, replaced by `@clack/prompts`, and feature presets must stop injecting `@types/inquirer` into generated apps.

#### Scenario: Workspace dependencies reflect Clack

- **WHEN** inspecting `package.json` files (root + `packages/cli-core`)
- **THEN** `@clack/prompts` is declared and bundled, no `inquirer*` packages remain, and the `init` feature presets no longer add `@types/inquirer` to new projects.
