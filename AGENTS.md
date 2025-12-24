<!-- OPENSPEC:START -->

# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:

- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:

- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

# Repository Guidelines

## Project Structure & Module Organization

Yarn 4 + Lerna workspaces organize sources under `packages/*`: `cli` hosts command entrypoints and generator templates, `cli-core` handles DI/prompt infrastructure, `cli-mcp` exposes MCP servers and tools, while `cli-plugin-*` packages bundle framework-specific blueprints plus their own tests. `cli-testing` provides shared harnesses, templates live in `packages/cli/templates`, artifacts land in `dist/`, VuePress + TSDoc files stay in `docs/`, and `tools/*` holds automation scripts (TypeScript references, ESLint, Vitest installers).

## Build, Test, and Development Commands

- `yarn build`: runs `monorepo build --verbose` across every workspace.
- `yarn build:references`: refreshes TS project references after renaming or adding packages.
- `yarn test`: executes the Vitest suite once; add `--coverage` for V8 reports.
- `yarn lint` / `yarn lint:fix`: applies the flat ESLint config + Prettier formatting used in CI.
- `yarn docs:serve` / `yarn docs:build`: runs `lerna run build && tsdoc` then serves or builds the VuePress site.

## Coding Style & Naming Conventions

Author TypeScript ES modules with 2-space indentation, double quotes, and trailing commas per the shared Prettier rules. Favor named exports and keep command providers in `packages/cli/src/commands/**/NameCmd.ts`, suffixing classes with `Cmd`. Tests and utilities mirror their source paths, ending in `.spec.ts` or `.integration.spec.ts`. Plugin packages follow `cli-plugin-<feature>` naming; templates underneath use kebab-case folder names. Keep import blocks sorted (enforced by `eslint-plugin-simple-import-sort`) and reserve default exports for entry aggregators such as `packages/cli/src/index.ts`.

## Testing Guidelines

Vitest powers both unit and integration coverage. Co-locate fast tests next to implementation files, while scenario-heavy suites live under `packages/*/test/**`. Use `yarn vitest packages/cli/src/commands/init/InitCmd.spec.ts` to focus a file, prefer `.integration.spec.ts` when exercising generators end-to-end, and ship PRs with `yarn test --coverage` so CI can enforce thresholds. Mock filesystem access via helpers in `cli-testing` instead of touching the real disk.

## Commit & Pull Request Guidelines

Commit messages must satisfy Conventional Commits (see `commitlint.config.js`); scope by workspace, e.g., `feat(cli-plugin-prisma): expand seed template`. Keep subjects under 200 characters and describe behavior, not implementation minutiae. Before opening a pull request, run `yarn build`, `yarn test`, and `yarn lint`, update docs/templates when behavior changes, and link the relevant issue. Summaries should highlight user-facing changes, test evidence, and screenshots or logs when generator output shifts.
