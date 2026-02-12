---
title: Build interactive prompts
description: Compose conversational flows with @tsed/cli-prompts and the Ts.ED DI container.
---

# Prompts & flows

`@tsed/cli-prompts` wraps `@clack/prompts` so every question runs inside the Ts.ED injector via the `PromptRunner` service. That means you can inject services, reuse providers, and share state while guiding users through generator wizards.

## Prompt types

Define prompts by returning a `PromptQuestion[]` (usually from the `$prompt` hook on a command). Each question sets its `type` field to one of:

- `input` / `password` for free-form data.
- `confirm` for yes/no gating.
- `list` (`select`) and `checkbox` (`multiselect`) when you need curated choices.
- `autocomplete` for async, searchable lookups.

Because the `PromptRunner` is an injectable service, you can resolve other services or merge defaults before returning the question list.

## Validation and branching

Use synchronous or async validation functions to reject invalid answers, then branch on the results with `when`. The snippet below chains multiple prompts, validates project names, loads autocomplete results, and toggles a confirm prompt based on previous answers:

<<< @/examples/cli/prompts-flow.ts

Highlights:

- Validation returns either `true` or a string error. Throwing will mark the prompt as failed.
- Branching is handled by `flow.when()`, letting you route users to custom subtasks or follow-up prompts.
- Because flows run in DI, you can log metrics, hit APIs, or read project settings mid-conversation without juggling imports.

## Reuse and testing

- Export prompts as classes or factory functions so multiple commands can reuse them. For example, create a `ProjectMetadataPrompt` provider and inject it anywhere you need consistent metadata questions.
- Use helpers from `@tsed/cli-testing` (e.g., `createPromptMock`) to stub user input in unit tests. This keeps generators deterministic and removes the need for brittle `stdin` hacks.
- When prompts emit events that trigger tasks, keep the orchestration thin: prompts collect data, tasks perform work.

Next, combine these prompts with `@tsed/cli-tasks` to stream long-running operations back to the user.
