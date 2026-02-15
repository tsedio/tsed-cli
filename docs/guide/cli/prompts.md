---
title: Build interactive prompts
description: Compose conversational flows with @tsed/cli-prompts and the Ts.ED DI container.
---

# Prompts & flows

`@tsed/cli-prompts` wraps `@clack/prompts` so every question runs inside the Ts.ED injector via the @@PromptRunner@@ service. That means you can inject services, reuse providers, and share state while guiding users through generator wizards.

## Prompt types

Define prompts by returning a `PromptQuestion[]` from the `$prompt` hook (decorators) or the `prompt()` option on @@command@@. Each question sets its `type` field to one of the following:

### `input` / `password`

Collect free-form text or secrets; combine with `default`, `validate`, or transformers:

```ts
{
  type: "input",
  name: "projectName",
  message: "Project name",
  default: initial.projectName || "awesome-cli",
  validate(value) {
    return /^[a-z0-9-]+$/i.test(value || "") ? true : "Use letters, numbers, or dashes.";
  }
}
```

### `confirm`

Gate follow-up actions with a yes/no prompt:

```ts
{
  type: "confirm",
  name: "installNow",
  message: "Install dependencies immediately?",
  default: true,
  when: (answers) => answers.runtime === "node"
}
```

### `list` and `checkbox`

Offer curated choices (single- or multi-select). Add `checked`, `disabled`, or custom labels as needed:

```ts
{
  type: "list",
  name: "runtime",
  message: "Select a runtime",
  choices: [
    {name: "Node.js (LTS)", value: "node"},
    {name: "Bun", value: "bun"}
  ]
},
{
  type: "checkbox",
  name: "features",
  message: "Pick optional features",
  choices: [
    {name: "MCP server", value: "cli-mcp"},
    {name: "Task runner", value: "cli-tasks"}
  ]
}
```

### `autocomplete`

Provide async, searchable selections backed by a `source` function:

```ts
{
  type: "autocomplete",
  name: "template",
  message: "Which starter template do you want to use?",
  source: async (_answers, keyword = "") => {
    const catalog = ["minimal", "fullstack", "plugin"];
    return catalog
      .filter((entry) => entry.includes(keyword))
      .map((value) => ({name: `${value} template`, value}));
  }
}
```

## Validation and branching

Use synchronous or async validation functions to reject invalid answers, then branch on the results with `when`. The snippets below show the same interactive command implemented with @@Command@@ and @@command@@ so prompts, tasks, and execution all live together:

::: code-group

<<< @/examples/cli/prompts-command-decorators.ts [Decorators]
<<< @/examples/cli/prompts-command-functional.ts [Functional API]

:::

::: tip Highlights

- Validation returns either `true` or a string error. Throwing will mark the prompt as failed.
- Branching is handled by `when`, letting you route users to follow-up prompts based on prior answers.
- Because commands run inside Ts.ED DI, prompts can access services, log metrics, or read project settings without manual wiring.

:::

Next, combine these prompts with `@tsed/cli-tasks` to stream long-running operations back to the user.
