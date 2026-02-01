## Context

`CliService.prompt` currently delegates to `Inquirer.prompt` and assumes that command providers return Inquirer question objects. Several commands in `packages/cli` and plugins rely on Inquirer-specific attributes (`choices` arrays, async `source` for autocomplete, `when` guards, `transformer` on inputs). Replacing Inquirer outright requires a compatibility layer because:

- Existing prompt definitions are scattered across core (`InitCmd`), generators (`GenerateCmd`), template scaffolds (`defineTemplate`), and plugins (`cli-plugin-typeorm`, `cli-plugin-passport`).
- CLIs built on `@tsed/cli-core` re-use the exported `QuestionOptions` type today; changing it without an adapter would be a breaking change for users upgrading their CLIs.
- Autocomplete relies on `inquirer-autocomplete-prompt`'s `source(answers, input)` contract, so we must supply an equivalent experience with Clack to avoid a regression when searching plugins/templates.

## Goals / Non-Goals

Goals:

- Provide a prompt runner backed by `@clack/prompts` that can execute the current mix of question types without requiring every command to change its prompts.
- Keep the public API (`CommandProvider.$prompt`, template `prompts()` hooks) stable while swapping the underlying renderer.
- Support async searchable selections (the existing autocomplete use cases) and the `when`/`default` semantics relied upon by `InitCmd` and template prompts.
- Remove Inquirer dependencies (runtime + types) from the monorepo and update docs/templates to talk about the new prompt contract.

Non-Goals:

- Redesign the CLI UX or consolidate multiple prompts into grouped flows (those can happen later once Clack is in place).
- Introduce brand new prompt types (e.g., date pickers) beyond what is already supported today.

## Decisions

1. **Prompt adapter layer**: add a `PromptRunner` (or `PromptService`) behind an explicit `PromptAdapter` interface inside `cli-core` that accepts the existing `QuestionOptions` union, iterates sequentially, and delegates to the underlying engine. In phase one the adapter simply proxies to `Inquirer.prompt` so behavior stays identical while we refactor call sites. Once tests confirm the adapter works everywhere, we will switch the implementation to invoke `@clack/prompts` primitives (`text`, `password`, `confirm`, `select`, `multiselect`) without touching callers. This boundary ensures the rest of the CLI never depends directly on the concrete prompt library. The runner evaluates `when` (booleans/functions), injects defaults, and merges each answer into the accumulator before moving to the next question to mimic Inquirer.
2. **Question schema ownership**: redefine `QuestionOptions` as a Ts.ED-owned union that mirrors the subset of Inquirer we rely on (name/message/type/default/choices/source/transformer). We will export this type from `@tsed/cli-core` so downstream CLIs can import it without pulling `@types/inquirer`.
3. **Autocomplete replacement**: once the adapter points at Clack, build a small custom prompt using `createPrompt` that displays the current result set and re-invokes a supplied `source(answers, keyword)` as the user types. This keeps async plugin/template searches working while staying inside the Clack ecosystem.
4. **Error & cancel handling**: when on Clack, use `isCancel` to detect Ctrl+C/ESC and immediately abort the CLI lifecycle with a friendly message (mirrors Inquirer's behavior today). The runner will throw a `PromptCancelledError` so `CliService` can short-circuit `$exec`.
5. **Dependency updates**: after the swap, remove `inquirer`, `inquirer-autocomplete-prompt`, and related type packages from every `package.json`, add `@clack/prompts` to `@tsed/cli-core`, and ensure the root CLI inherits it through workspace dependencies.

## Risks / Trade-offs

- **Autocomplete parity**: Clack does not ship an autocomplete prompt out of the box, so we must maintain a small custom prompt. Risk: UX differences (e.g., no highlighting) or edge cases (API rate limits) if the `source` function fires too often. Mitigation: throttle input changes and reuse the existing `source` contract so we can write targeted tests.
- **Behavior drift**: If we miss a property that Inquirer honored (`transformer`, `checked` default for checkboxes), prompts could behave differently. Mitigation: add unit tests around the new runner covering each question type and re-run the existing integration suites for `init`, `generate`, `template`, and plugin generators.
- **Downstream CLIs**: Removing `@types/inquirer` is breaking for anyone importing it from `@tsed/cli-core`. Mitigation: document the new `PromptQuestion` export and call this out in release notes so adopters can swap to the provided type without rewriting their question arrays.

## Migration Plan

1. Create the new `PromptRunner` abstraction (plus a `PromptQuestion` union) under `packages/cli-core/src/services/prompts/`. Implement adapters for each supported type, including the custom autocomplete prompt backed by `@clack/prompts`' `createPrompt`.
2. Update `CliService` to depend on `PromptRunner` rather than `Inquirer`, wire cancellation handling, and ensure DI contexts still receive the merged answers.
3. Replace imports of `QuestionOptions`/`Answers` in `cli-core` and `cli` packages with the new type, deleting `import "inquirer-autocomplete-prompt"` and any references to `AutocompletePrompt`.
4. Remove `inquirer*` dependencies and add `@clack/prompts` to the relevant `package.json` files; update feature templates (`FeatureType.COMMANDS`) so new projects bring in the right dev dependencies.
5. Refresh documentation and scaffolding (readmes, command templates) so they talk about Clack and the Ts.ED prompt contract instead of pointing users to Inquirer docs.
6. Extend unit/integration tests to cover the new runner, especially autocomplete searches (
   `AddCmd`, `GenerateCmd`, template prompts) and the large `InitCmd` checkbox/list flows.

## Open Questions

1. Should we expose the raw `@clack/prompts` APIs (e.g., `select`, `multiselect`) for advanced users, or keep the current declarative question objects as the only supported contract?
2. How should the CLI behave when a prompt is cancelled—should we mimic Inquirer (throw) or leverage Clack's `cancel()` helper for a softer exit message?
3. Do we need to support nested/grouped prompts via Clack's `group()` helper right away, or can that wait for a later enhancement once the adapter lands?
