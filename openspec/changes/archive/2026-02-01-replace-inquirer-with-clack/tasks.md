## 1. Prompt abstraction (Inquirer-backed)

- [ ] 1.1 Define a Ts.ED-owned `PromptQuestion`/`QuestionOptions` union that captures the subset of prompt properties we support (name, message, type, when, default, choices, source, transformer, etc.).
- [ ] 1.2 Implement a `PromptRunner` (or `PromptService`) plus `PromptAdapter` interface; the initial adapter delegates to `Inquirer.prompt` so behavior remains unchanged.
- [ ] 1.3 Update `CliService`, `CommandProvider`/`CommandOptions`, and template helpers (`defineTemplate`) to rely on the runner instead of importing Inquirer directly.
- [ ] 1.4 Add coverage ensuring the runner handles every supported type, skips prompts via `when`, and surfaces cancellations (still using Inquirer under the hood).

## 2. Clack migration

- [ ] 2.1 Inventory every package that depends on `inquirer`, `inquirer-autocomplete-prompt`, or their type packages so we can remove them once the adapter flips.
- [ ] 2.2 Add `@clack/prompts` (along with any helper dependencies) to `@tsed/cli-core` and update lockfiles.
- [ ] 2.3 Replace the adapter implementation to call `@clack/prompts` primitives (`text`, `password`, `confirm`, `select`, `multiselect`) and introduce a custom autocomplete prompt built with `createPrompt`, honoring the existing `source(answers, keyword)` contract.
- [ ] 2.4 Remove the Inquirer packages and type dependencies (root + `packages/cli-core`), ensuring feature presets such as `FeatureType.COMMANDS` stop injecting `@types/inquirer`.
- [ ] 2.5 Extend runner tests to cover the Clack implementation, including async autocomplete search and cancel handling via `isCancel`.

## 3. CLI integration & ecosystem updates

- [ ] 3.1 Ensure all first-party command/template prompts (`init`, `generate`, `add`, `template`, plugin templates) remain compatible with the adapter (no Inquirer-specific imports/comments).
- [ ] 3.2 Refresh `packages/cli-core/readme.md`, command templates, and any docs that reference “Inquirer” to describe the new prompt contract and Clack engine (include migration notes for downstream CLIs).
- [ ] 3.3 Mention the two-phase migration (adapter, then Clack) in release notes/changelog so consumers know how to roll out the update.

## 4. Validation

- [ ] 4.1 Re-run the relevant unit/integration suites (`yarn test` or targeted Vitest runs covering `cli-core` and `packages/cli` commands) after each phase to ensure prompts still behave.
- [ ] 4.2 Manually exercise key commands (`tsed init`, `tsed generate`, `tsed template`, `tsed add`) in both phases (Inquirer-backed adapter, then Clack) to confirm list/checkbox/autocomplete flows behave as expected.
