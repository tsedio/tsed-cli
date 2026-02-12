---
title: Build interactive prompts
description: Compose conversational flows with @tsed/cli-prompts and the Ts.ED DI container.
---

# Prompts & flows

`@tsed/cli-prompts` wraps `@clack/prompts` so every question runs inside the Ts.ED injector via the @@PromptRunner@@ service. That means you can inject services, reuse providers, and share state while guiding users through generator wizards.

## Prompt types

Define prompts by returning a `PromptQuestion[]` from the `$prompt` hook (decorators) or the `prompt()` option on @@command@@. Each question sets its `type` field to one of:

- `input` / `password` for free-form data.
- `confirm` for yes/no gating.
- `list` (`select`) and `checkbox` (`multiselect`) when you need curated choices.
- `autocomplete` for async, searchable lookups.

Because the `PromptRunner` is an injectable service, you can resolve other services or merge defaults before returning the question list.

## Validation and branching

Use synchronous or async validation functions to reject invalid answers, then branch on the results with `when`. The snippets below show the same interactive command implemented with @@Command@@ and @@command@@ so prompts, tasks, and execution all live together:

::: code-group

<<< @/examples/cli/prompts-command-decorators.ts [Decorators]
<<< @/examples/cli/prompts-command-functional.ts [Functional API]

:::

Highlights:

- Validation returns either `true` or a string error. Throwing will mark the prompt as failed.
- Branching is handled by `when`, letting you route users to follow-up prompts based on prior answers.
- Because commands run inside Ts.ED DI, prompts can access services, log metrics, or read project settings without manual wiring.

Next, combine these prompts with `@tsed/cli-tasks` to stream long-running operations back to the user.
