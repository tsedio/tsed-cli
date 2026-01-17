# Change: Replace Inquirer with @clack/prompts in CLI core

## Why

The current prompt subsystem in `@tsed/cli-core` is tightly coupled to Inquirer and the `inquirer-autocomplete-prompt` plugin. This creates several issues:

- Inquirer and its autocomplete plugin add ~300 transitive dependencies, slow down startup, and are CommonJS-only, which complicates Ts.ED's ESM toolchain.
- The CLI exports Inquirer types (`QuestionOptions`, `Answers`) so every command or template that defines prompts must also depend on `@types/inquirer`, leaking an implementation detail and forcing downstream users to keep those types in sync.
- We cannot ship more modern UX niceties (grouped prompts, cancellable flows, consistent spinners) without reworking the adapter anyway; `@clack/prompts` already provides those primitives with a much smaller surface.
- Autocomplete prompts today require a custom inquirer plugin; moving away from that plugin is a prerequisite to make async search prompts work the same way for MCP tooling and scripted flows.

Switching to `@clack/prompts` lets us own the prompt contract inside `cli-core`, reduce dependencies, and unblock future UX/automation improvements.

## What Changes

- Introduce a `PromptRunner` (or similar) inside `cli-core` backed by a Ts.ED-owned abstraction (e.g., `PromptAdapter`). Phase one keeps Inquirer behind this adapter to guarantee zero behavioral drift; phase two swaps the adapter implementation to `@clack/prompts` once tests confirm parity. The runner covers `input`, `password`, `confirm`, `list` (select), `checkbox` (multiselect), and async `autocomplete` questions.
- Replace the Inquirer-specific `QuestionOptions`/`Answers` types with a Ts.ED-defined prompt schema that is backwards-compatible with existing question objects (name/message/type/choices/when/default/source/etc.) so plugin authors do not have to rewrite every prompt.
- Remove the `inquirer`/`inquirer-autocomplete-prompt` runtime dependencies and their type packages from the monorepo, add `@clack/prompts`, and update `CliService`, templates, and documentation to reference the new prompt engine.
- Update CLI commands (`init`, `generate`, `add`, `template`, template definitions, and plugin templates such as `cli-plugin-typeorm` and `cli-plugin-passport`) to ensure any prompt-specific helpers (`transformer`, `source`, choice objects) work with the new adapter.
- Document the new prompt contract (including how async search prompts behave) so downstream CLIs know which properties are respected without depending on Inquirer types.

## Impact

- Affected specs: `cli-prompt-engine`
- Affected code: `packages/cli-core/src/services/CliService.ts`, `packages/cli-core/src/interfaces/{CommandProvider,CommandOptions}.ts`, `packages/cli-core/src/index.ts`, `packages/cli-core/readme.md`, `packages/cli/**` prompt definitions (commands + templates), `packages/cli-plugin-*/**/prompts`, root `package.json`, `packages/cli-core/package.json`, docs referencing Inquirer
