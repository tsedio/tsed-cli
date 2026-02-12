---
title: Templates
description: Author generator templates with defineTemplate(), schema-driven prompts, and render hooks.
---

# Template authoring

@@defineTemplate@@ (exported from `@tsed/cli`) registers reusable generators that appear under `tsed generate`. Templates can prompt for custom data, validate it, and return string content or richer render instructions that the CLI writes to disk.

## Minimal template

```ts
import {defineTemplate} from "@tsed/cli";

export default defineTemplate({
  id: "service",
  label: "Service class",
  outputDir: "{{srcDir}}/services",
  fileName: "{{symbolName}}.service",
  render(symbolName) {
    return `export class ${symbolName}Service {}`;
  }
});
```

Run it with `tsed generate service --name Logger`.

::: tip Need a starting point?
To scaffold a boilerplate file in `.templates/`, run:

```bash
tsed generate template
```

:::

::: warning
Template `id` values must be unique; collisions override previous definitions.
:::

## File metadata

The following options control how generated files are named and where they land:

- `fileName`: Mustache-style template; defaults to `{{symbolName}}`.
- `ext`: Override the file extension (omit the dot) or set to `null` to skip.
- `preserveCase`: When `true`, the CLI does not convert `symbolName` to kebab/snake case.
- `preserveDirectory`: Keep nested folder structures when generating batches.
- `hidden`: Hide the template from the interactive picker (useful for internal scaffolds).

```ts
defineTemplate({
  id: "docker-compose",
  label: "Docker compose",
  outputDir: ".",
  fileName: "docker-compose",
  ext: "yaml",
  preserveCase: true,
  hidden: false,
  render() {
    return "version: '3.8'\nservices:\n  app:\n    image: node:20";
  }
});
```

## Schema-driven prompts

Use the `schema` field (same `@tsed/schema` DSL as commands) to declare template-specific options. The CLI reuses it for prompt flows, Commander flags, MCP validation, and AJV checks.

```ts
import {s} from "@tsed/schema";

defineTemplate({
  id: "resolver",
  label: "GraphQL resolver",
  outputDir: "{{srcDir}}/resolvers",
  schema: s.object({
    model: s.string().prompt("Model name").default("User"),
    auth: s.boolean().prompt("Guard with auth?").default(true)
  }),
  render(symbolName, ctx) {
    const guard = ctx.auth ? "@UseAuth()" : "";
    return `@Resolver()\nexport class ${symbolName}Resolver {${guard}}`;
  }
});
```

::: tip
Combine `schema` with `prompts()` only when you need bespoke question flows. For most use cases the schema alone keeps CLI flags and prompts in sync.
:::

## Custom prompts

When you need full control, add a `prompts()` hook. You can mix it with `schema` (schema covers validation; prompts cover UX tweaks).

```ts
defineTemplate({
  id: "protocol",
  label: "Passport protocol",
  outputDir: "{{srcDir}}/protocols",
  prompts(data) {
    return [
      {
        type: "autocomplete",
        name: "strategy",
        message: "Select a strategy",
        source: () => [
          {name: "JWT", value: "jwt"},
          {name: "OAuth2", value: "oauth2"}
        ]
      }
    ];
  },
  render(symbolName, ctx) {
    return `export class ${symbolName}${ctx.strategy.toUpperCase()}Protocol {}`;
  }
});
```

## Render return types

`render()` can return:

- A string (written as the file content).
- `undefined` to skip writing (useful when the template exists only to run hooks).
- An object `{content, fileName, outputDir}` when you need to override metadata dynamically.

```ts
defineTemplate({
  id: "multi-file",
  label: "Service + spec",
  outputDir: "{{srcDir}}/services",
  render(symbolName, ctx) {
    return [
      {content: `export class ${symbolName}Service {}`, fileName: `${symbolName}.service.ts`},
      {content: `describe("${symbolName}", () => {});`, outputDir: ctx.specDir, fileName: `${symbolName}.service.spec.ts`}
    ];
  }
});
```

## Lifecycle hooks

Add `hooks` to run custom logic after files are created (formatting, import injection, code mods, etc.). Hooks receive the underlying `ts-morph` `SourceFile`.

```ts
import type {SourceFile} from "ts-morph";

defineTemplate({
  id: "decorator",
  label: "Ts.ED decorator",
  outputDir: "{{srcDir}}/decorators",
  render: (symbolName) => `export function ${symbolName}(): MethodDecorator {}`,
  hooks: {
    $afterCreateSourceFile(file: SourceFile) {
      file.formatText({indentSize: 2});
      return file;
    }
  }
});
```

## Using templates via MCP

Any template registered through `defineTemplate()` is automatically exposed to the MCP tooling (`tsed-mcp`, `@tsed/cli-mcp`). Pair templates with schema metadata so AI clients receive structured descriptions and validations without any extra wiring.
