# @tsed/cli-prompts

<p style="text-align: center" align="center">
 <a href="https://tsed.dev" target="_blank"><img src="https://tsed.dev/tsed-og.png" width="200" alt="Ts.ED logo"/></a>
</p>

[![Build & Release](https://github.com/tsedio/tsed-cli/workflows/Build%20&%20Release/badge.svg?branch=master)](https://github.com/tsedio/tsed-cli/actions?query=workflow%3A%22Build+%26+Release%22)
[![TypeScript](https://badges.frapsoft.com/typescript/love/typescript.svg?v=100)](https://github.com/ellerbrock/typescript-badges/)

> Ts.ED’s prompt runner, powered by `@clack/prompts`, with a declarative schema shared across every CLI package.

## Goals

`@tsed/cli-prompts` extracts the reusable prompt subsystem that used to live in `@tsed/cli-core`. The package owns:

- The canonical `PromptQuestion` schema used by command providers and template generators.
- A `PromptRunner` service that evaluates `when` guards, resolves defaults, and dispatches to prompt handlers.
- A Clack-based implementation of every prompt type Ts.ED commands rely on (`input`, `password`, `confirm`, `list`, `checkbox`, `autocomplete`).
- Consistent cancellation/Error handling via `PromptCancelledError`.

Shipping this as a standalone package lets other workspaces (and downstream CLIs) reuse the exact same behavior without duplicating abstractions or third-party dependencies.

## Installation

```bash
npm install @tsed/cli-prompts @tsed/core @tsed/di
```

> `@tsed/di` is required because the prompt runner is an injectable service.

## Features

- **Clack UX**: Interactively renders all prompts via `@clack/prompts` (selects, multiselects, autocomplete loops, password masking, etc.).
- **Declarative schema**: Define questions with the standard Ts.ED structure (`name`, `type`, `message`, `choices`, `default`, `when`, `validate`, `filter`, `transformer`).
- **Async autocomplete**: Built-in support for searchable lists using the `source(answers, keyword)` contract used by `tsed add`, `tsed generate`, and MCP tooling.
- **Cancellation safety**: `ensureNotCancelled()` converts Ctrl+C / ESC exits into a thrown `PromptCancelledError`, allowing CLI hosts to render a friendly message and abort.
- **Transformer & validation helpers**: All handlers consistently run `transformer`, `filter`, and `validate` hooks before finalizing the answer.

## Getting started

When you build a CLI that uses `@tsed/cli-core`, the prompt runner is already injected for you. To use it directly, register it inside your DI context:

```typescript
import {CliPlatformTest} from "@tsed/cli-testing";
import {PromptRunner, PromptQuestion} from "@tsed/cli-prompts";

await CliPlatformTest.create();
const runner = await CliPlatformTest.invoke<PromptRunner>(PromptRunner);

const questions: PromptQuestion[] = [
  {
    type: "input",
    name: "packageName",
    message: "Package name",
    validate(value) {
      return value ? true : "Package name is required";
    }
  },
  {
    type: "autocomplete",
    name: "feature",
    message: "Choose a feature",
    source: async (_answers, keyword = "") => {
      return ["cli-core", "cli-prompts", "cli-mcp"].filter((entry) => entry.includes(keyword)).map((value) => ({name: value, value}));
    }
  }
];

const answers = await runner.run(questions);
console.log(answers);
```

> 📚 Want a larger multi-step flow? See [`docs/examples/cli/prompts-command-decorators.ts`](../../docs/examples/cli/prompts-command-decorators.ts) or the [CLI prompts guide](https://cli.tsed.dev/guide/cli/prompts) for a production-style walkthrough that stays in sync with this repository.

### Supported question types

| Type           | Description                                              |
| -------------- | -------------------------------------------------------- |
| `input`        | Free-form text entry with optional transform/validation. |
| `password`     | Hidden input with customizable mask characters.          |
| `confirm`      | Boolean yes/no selection.                                |
| `list`         | Single-select list rendered with Clack’s `select`.       |
| `checkbox`     | Multi-select list rendered with `multiselect`.           |
| `autocomplete` | Searchable list that re-queries a `source` function.     |

Every question can declare `when` guards, `default` values (including functions that read previous answers), `pageSize`, and `choices` metadata (`name`, `value`, `short`, `checked`, `disabled`).

### Handling cancellations

Ctrl+C and ESC bubble up as `PromptCancelledError`. Catch it at the application boundary (as `CliCore` does) if you need custom messaging:

```typescript
import {PromptRunner, PromptCancelledError} from "@tsed/cli-prompts";

try {
  await runner.run(questionList);
} catch (er) {
  if (er instanceof PromptCancelledError) {
    console.log("Prompt cancelled by the user.");
    process.exit(0);
  }
  throw er;
}
```

## Contributors

Please read [contributing guidelines here](https://tsed.dev/CONTRIBUTING.html)

<a href="https://github.com/tsedio/ts-express-decorators/graphs/contributors"><img src="https://opencollective.com/tsed/contributors.svg?width=890" /></a>

## Backers

Thank you to all our backers! 🙏 [[Become a backer](https://opencollective.com/tsed#backer)]

<a href="https://opencollective.com/tsed#backers" target="_blank"><img src="https://opencollective.com/tsed/tiers/backer.svg?width=890"></a>

## Sponsors

Support this project by becoming a sponsor. Your logo will show up here with a link to your
website. [[Become a sponsor](https://opencollective.com/tsed#sponsor)]

## License

The MIT License (MIT)

Copyright (c) 2016 - Today Romain Lenzotti

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit
persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the
Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
