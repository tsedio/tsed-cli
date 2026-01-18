## 1. Package scaffolding

- [x] 1.1 Create `packages/cli-tasks` with package.json, tsconfig, build/test scripts, and workspace wiring (root package.json, yarn workspaces, tsconfig references).
- [x] 1.2 Implement the runner helpers (`Task`, `Tasks`, `TaskRunnerOptions`, `createTasks`, `createSubTasks`, `createTasksRunner`) inside the new package, wrapping Listr2 and exposing a logger adapter option.
- [x] 1.3 Add unit tests covering renderer selection, logger binding, and nested sub-task creation; ensure `NODE_ENV=test` still enables the silent renderer.

## 2. Adopt the abstraction in cli-core/cli

- [x] 2.1 Update `packages/cli-core` to depend on `@tsed/cli-tasks`, remove its direct `listr2` dependency, and re-export `Task`/`Tasks` for backwards compatibility.
- [x] 2.2 Wire `CliService`, `CliPlugins`, and any other helpers to consume the new runner API, passing the Ts.ED logger through the options.
- [x] 2.3 Update `packages/cli` commands plus all `cli-plugin-*` packages to import `Task` (and `createSubTasks` where needed) from `@tsed/cli-tasks`/`cli-core` exports instead of `listr2`.

## 3. Documentation & templates

- [x] 3.1 Refresh `packages/cli-core/readme.md`, command templates, and any docs mentioning “Listr” so they reference `@tsed/cli-tasks` and describe the abstraction.
- [x] 3.2 Add release notes or changelog entry (if applicable) clarifying that tasks should use `@tsed/cli-tasks` and that Listr is now an implementation detail.

## 4. Validation

- [ ] 4.1 Run targeted unit/integration suites for `cli-core`, `cli`, and affected plugins (`yarn test`, or scoped vitest runs) plus a CLI smoke test (`tsed init --dry-run` if available) to confirm tasks still execute and log correctly. _(Executed `yarn vitest packages/cli-core` + `yarn vitest packages/cli-tasks`; CLI smoke test still pending.)_
- [ ] 4.2 Verify lint/build steps succeed for the new package and the monorepo (`yarn lint`, `yarn build`) to ensure dependency updates and type exports are sound. _(Ran `yarn workspace @tsed/cli-tasks build` after `yarn install`; full repo lint/build still outstanding.)_
