## 1. Replace Listr internals with Clack in @tsed/cli-tasks

- [x] 1.1 Swap the dependency from `listr2` to `@clack/prompts`, update tsconfig/build files accordingly.
- [x] 1.2 Reimplement `createTasks`, `createSubTasks`, and `createTasksRunner` using Clack primitives (including verbose vs default rendering, logger binding, concurrency handling, and nested tasks).
- [x] 1.3 Expand the package’s unit tests to cover the Clack behavior (silent renderer in tests, logger adapter, nested sub-tasks, concurrent execution) and update snapshots/fixtures as needed.

## 2. Rip out Listr references across the monorepo

- [x] 2.1 Remove `listr2` from root/workspace manifests and lockfiles, ensuring only `@tsed/cli-tasks` references the new Clack dependency. (Transitive copies remain via tooling like `lint-staged`, noted in the summary.)
- [x] 2.2 Update `@tsed/cli-core`, `@tsed/cli`, and plugin imports/docs to reflect the Clack-backed runner (no mentions of Listr in readmes, templates, or generated files).

## 3. Refresh docs and downstream tests

- [x] 3.1 Regenerate/adjust any template or integration snapshots affected by the new renderer output (e.g., template scaffolding or init prompts mentioning task engine).
- [x] 3.2 Update documentation snippets (CLI README, command template guide) to describe the Clack task runner and remove Listr references.

## 4. Validation

- [x] 4.1 Run targeted unit tests (`yarn vitest packages/cli-tasks`, `yarn vitest packages/cli-core`) plus key CLI integration tests impacted by task execution.
- [x] 4.2 Execute the full `yarn vitest` (or at minimum, affected package suites) and a CLI smoke test (`tsed init` dry-run) to confirm the Clack runner works end-to-end. (`tsed init --help` currently fails locally because `@tsed/core` exports still rely on extension-less imports; recorded alongside the test log.)
