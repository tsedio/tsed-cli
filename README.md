<p style="text-align: center" align="center">
 <a href="https://tsed.dev" target="_blank"><img src="https://tsed.dev/tsed-og.png" width="200" alt="Ts.ED logo"/></a>
</p>

<div align="center">
  <h1>Ts.ED CLI</h1>

[![Build & Release](https://github.com/tsedio/tsed-cli/workflows/Build%20&%20Release/badge.svg?branch=master)](https://github.com/tsedio/tsed-cli/actions?query=workflow%3A%22Build+%26+Release%22)
[![PR Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/tsedio/tsed-cli/blob/master/CONTRIBUTING.md)
[![Coverage Status](https://coveralls.io/repos/github/tsedio/tsed-cli/badge.svg?branch=master)](https://coveralls.io/github/tsedio/tsed-cli?branch=master)
[![npm version](https://badge.fury.io/js/%40tsed%2Fcli.svg)](https://badge.fury.io/js/%40tsed%2Fcli)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![backers](https://opencollective.com/tsed/tiers/badge.svg)](https://opencollective.com/tsed)

  <br />
<div align="center">
  <a href="https://cli.tsed.dev/">Website</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://cli.tsed.dev/getting-started.html">Getting started</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://slack.tsed.dev">Slack</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://twitter.com/TsED_io">Twitter</a>
</div>
  <hr />
</div>

## Overview

Ts.ED CLI is the official project generator and automation toolkit for Ts.ED applications. This repository is a Yarn 4 + Lerna monorepo that keeps the CLI core, plugins, generators, documentation, and automation scripts in sync. Refer to the [documentation](https://cli.tsed.dev/) for deep dives into commands, MCP tools, and authoring guides.

## Recent Updates

- Adopted a Yarn 4 + Lerna workspace layout backed by `@tsed/monorepo-utils`, so `monorepo` scripts can orchestrate builds, cleaning, publishing, and package syncing across every workspace.
- Consolidated CLI building blocks: commands live under `packages/cli`, DI/prompt infrastructure in `packages/cli-core`, and shared tasks under `@tsed/cli-tasks`, ensuring plugins and templates render with the same `@clack/prompts` UX.
- Refreshed the documentation pipeline so `tsdoc` feeds the VitePress site (`docs/`) and publishes to `cli.tsed.dev` through the `docs:*` scripts described below.

## Workspace layout

| Path                     | Purpose                                                                                                    |
| ------------------------ | ---------------------------------------------------------------------------------------------------------- |
| `packages/cli`           | Command entrypoints, `tsed` bin, and generator templates consumed by end users.                            |
| `packages/cli-core`      | Dependency injection, prompting helpers, context utilities, and shared task orchestration.                 |
| `packages/cli-mcp`       | MCP servers and tools that expose CLI capabilities to external agents.                                     |
| `packages/cli-plugin-*`  | Framework- or feature-specific blueprints packaged as installable plugins.                                 |
| `packages/cli-testing`   | Reusable testing harnesses, filesystem fakes, and fixtures for deterministic specs.                        |
| `packages/cli/templates` | Handlebars/EJS templates that power `tsed init`, `add`, and plugin generators.                             |
| `docs/`                  | VitePress site, TSDoc output, and guides served via `yarn docs:serve` or published through `docs:publish`. |
| `dist/`                  | Build artifacts produced by `yarn build` and published to npm.                                             |
| `tools/*`                | Automation helpers (TypeScript references, ESLint/Vitest installers, CI glue) invoked by `yarn build:*`.   |

## Development scripts

| Command                                   | Description                                                                                             |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `yarn configure`                          | Prepares CI metadata via `monorepo ci configure`.                                                       |
| `yarn clean`                              | Removes build output across every workspace with `monorepo clean workspace`.                            |
| `yarn build`                              | Runs `monorepo build --verbose`, compiling every package and depositing artifacts in `dist/`.           |
| `yarn build:references`                   | Refreshes TypeScript project references through `tools/typescript`. Run after adding/renaming packages. |
| `yarn build:eslint` / `yarn build:vitest` | Installs pinned ESLint and Vitest binaries inside `tools/`.                                             |
| `yarn sync:packages`                      | Aligns dependency versions between packages with `monorepo sync packages`.                              |
| `yarn lint` / `yarn lint:fix`             | Applies the flat ESLint + Prettier setup (with `eslint-plugin-simple-import-sort`) across the repo.     |
| `yarn test [--coverage]`                  | Executes the Vitest suite once. Add `--coverage` for the V8 report enforced in CI.                      |
| `yarn docs:serve` / `yarn docs:build`     | Generates API docs with `tsdoc`, builds the VitePress site, then serves or builds the static output.    |
| `yarn docs:publish`                       | Publishes the VitePress build to `cli.tsed.dev` via the configured `gh-pages` target.                   |
| `yarn api:build` / `yarn api:build:dev`   | Rebuilds `docs/api` with `tsc -b` + `tsdoc`; the `:dev` variant watches templates with `chokidar`.      |
| `yarn release` / `yarn release:dryRun`    | Triggers `semantic-release` to publish packages (or simulate the process).                              |

> Tip: run package-scoped commands with `yarn workspace <pkg> <script>` (for example, `yarn workspace @tsed/cli vitest run packages/cli/src/commands/init/InitCmd.spec.ts`).

## Local development

1. **Install dependencies**  
   Enable Corepack (if needed) then install once for the monorepo and docs:

   ```bash
   corepack enable
   yarn install
   ```

   The root `postinstall` step automatically installs `docs/` dependencies.

2. **Build and iterate**

   - `yarn build` ensures every package emits fresh artifacts under `dist/`.
   - Use targeted builds/tests via `yarn workspace <pkg> <command>` for fast feedback.
   - When touching DI helpers (`context()`, `runInContext`, etc.), rely on `cli-testing` utilities like `DITest.create()` inside specs.

3. **Test and lint**

   - `yarn test --coverage` before opening a PR so CI thresholds stay green.
   - Co-locate fast unit specs next to sources and keep scenario tests under `packages/*/test/**`.
   - Mock filesystem/process work with helpers from `cli-testing` and `CliExeca` to avoid flaky suites.

4. **Docs and templates**
   - Iterate on documentation with `yarn docs:serve`.
   - Generator templates live in `packages/cli/templates`; plugin-specific templates stay inside their respective `cli-plugin-*` packages.
   - Run `yarn build:references` whenever new packages or templates are added so TS project references stay accurate.

## Contributors

Please read [contributing guidelines here](https://tsed.dev/CONTRIBUTING.html)

<a href="https://github.com/tsedio/ts-express-decorators/graphs/contributors"><img src="https://opencollective.com/tsed/contributors.svg?width=890" /></a>

## Backers

Thank you to all our backers! 🙏 [[Become a backer](https://opencollective.com/tsed#backer)]

<a href="https://opencollective.com/tsed#backers" target="_blank"><img src="https://opencollective.com/tsed/tiers/backer.svg?width=890"></a>

## Sponsors

Support this project by becoming a sponsor. Your logo will show up here with a link to your website. [[Become a sponsor](https://opencollective.com/tsed#sponsor)]

## License

The MIT License (MIT)

Copyright (c) 2016 - 2023 Romain Lenzotti

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
