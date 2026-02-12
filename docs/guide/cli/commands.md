---
title: Command configuration
description: Understand the @Command decorator and command() helper plus every shared option.
---

# Command configuration

`@tsed/cli-core` exposes two equivalent APIs: the `@Command` decorator for class-based providers and the `command()` helper for lightweight functions. Both surface the same option bag defined in `packages/cli-core/src/interfaces/CommandOptions.ts`.

## Two APIs, same surface

::: code-group

```ts [Decorators]
import {CliExeca, Command, type CommandProvider} from "@tsed/cli-core";
import type {PromptQuestion} from "@tsed/cli-prompts";
import type {Task} from "@tsed/cli-tasks";
import {inject} from "@tsed/di";

interface BuildContext {
  project: string;
  install: boolean;
}

@Command({
  name: "build:assets",
  alias: "ba",
  description: "Bundle templates and install deps",
  args: {
    project: {description: "Project path", type: String, required: true}
  },
  options: {
    "--no-install": {description: "Skip package installation", type: Boolean}
  }
})
export class BuildAssetsCmd implements CommandProvider<BuildContext> {
  protected cliExeca = inject(CliExeca);

  async $prompt(initial: Partial<BuildContext>): Promise<PromptQuestion[]> {
    return [
      {
        type: "confirm",
        name: "install",
        message: "Install dependencies?",
        default: initial.install ?? true
      }
    ];
  }

  $mapContext(ctx: Partial<BuildContext>): BuildContext {
    return {
      project: (ctx.project || process.cwd()).trim(),
      install: ctx.install ?? true
    };
  }

  async $exec(ctx: BuildContext): Promise<Task<BuildContext>[]> {
    return [
      {
        title: "Install dependencies",
        skip: (state) => (!state.install ? "Skipped by prompt" : false),
        task: (state) =>
          this.cliExeca.run("npm", ["install"], {
            cwd: state.project
          })
      }
    ];
  }
}
```

```ts [Functional API]
import {CliExeca, command} from "@tsed/cli-core";
import type {PromptQuestion} from "@tsed/cli-prompts";
import {inject} from "@tsed/di";

interface BuildContext {
  project: string;
  install: boolean;
}

function prompt(initial: Partial<BuildContext>): PromptQuestion[] {
  return [
    {
      type: "input",
      name: "project",
      message: "Project directory",
      default: initial.project || "./"
    },
    {
      type: "confirm",
      name: "install",
      message: "Install dependencies?",
      default: initial.install ?? true
    }
  ];
}

export const BuildAssetsCmd = command<BuildContext>({
  name: "build:assets",
  description: "Bundle templates and install deps",
  alias: "ba",
  prompt,
  handler(ctx) {
    const cliExeca = inject(CliExeca);
    return [
      {
        title: "Install dependencies",
        skip: (state) => (!state.install ? "Skipped by prompt" : false),
        task: (state) =>
          cliExeca.run("npm", ["install"], {
            cwd: state.project || process.cwd()
          })
      }
    ];
  }
}).token();
```

:::

## Input schema <Badge text="Beta" />

Introduced in v7, Input Schema lets you describe CLI options and prompts once, then reuse that definition everywhere. Attach a `@tsed/schema` JSON schema (or factory) to drive prompt flows, Commander flags, MCP contracts, and AJV validation in one go. Prefer this over ad-hoc `args`/`options` whenever you can.

#### Base fields

```ts
import {s} from "@tsed/schema";

@Command({
  inputSchema:
    s.object({
      project: s.string().description("Absolute path").default("."),
      install: s.boolean().default(true)
    })
})
```

#### Prompts + choices + CLI flags

```ts
import {PlatformType} from "@tsed/cli-core";


@Command({
  inputSchema:
    s.object({
      platform: s
        .enums(PlatformType)
        .default(PlatformType.EXPRESS)
        .prompt("Choose a platform")
        .choices([
          {label: "Express.js", value: PlatformType.EXPRESS},
          {label: "Fastify.js (beta)", value: PlatformType.FASTIFY}
        ])
        .opt("-p, --platform <platform>")
    })
})
```

#### Conditional prompts with `.when()`

```ts
@Command({
  inputSchema:
    s.object({
      root: s.string().default("."),
      projectName: s
        .string()
        .prompt("Project name")
        .when((ctx) => ctx.root !== ".")
        .description("Defaults to the folder name when root is '.'")
    })
})
```

#### Nested arrays with grouped choices

```ts
import {FeatureType} from "@tsed/cli-core";

@Command({
  inputSchema: () =>
    s.object({
      features: s
        .array()
        .items(s.enums(FeatureType))
        .prompt("Select features")
        .choices([
          {
            label: "ORM",
            value: FeatureType.ORM,
            items: [
              {label: "Prisma", value: FeatureType.PRISMA},
              {label: "TypeORM", value: FeatureType.TYPEORM}
            ]
          }
        ])
    })
})
```

::: tip
Whenever a field needs CLI flags, prompts, or MCP validation, encode it in `inputSchema` using helpers like `.prompt()`, `.choices()`, `.when()`, `.opt()`, and `.items()`—it keeps every interface in sync and lets Ts.ED run AJV validation for free.
:::

## Options

The following keys exist on both APIs via `BaseCommandOptions`:

### `name`, `alias`, and `description`

The command must be uniquely named. `alias` registers short forms (`tsed ba`) and `description` feeds auto-generated help output.

### `args`

Declare positional arguments using the Commander syntax. Each entry inherits the `CommandArg` structure:

```ts
args: {
  project: {description: "Target directory", type: String, required: true},
  port: {description: "Dev server port", type: Number, defaultValue: 8080}
}
```

### `options`

Flag-like options map to Commander’s `.option()` configuration and support advanced parsing:

```ts
@Commmand({
  options: {
    "--pkg-manager <name>": {
      description: "npm, pnpm, bun, yarn",
      type: String,
      customParser: (value) => value.toLowerCase()
    },
    "--feature <items...>": {
      description: "Additional generators",
      type: Array,
      itemType: String
    }
  }
})
```

## Input schema

Introduced in v7, Input Schema lets you describe CLI options and prompts once, then reuse that definition everywhere. Attach a `@tsed/schema` JSON schema (or factory) to drive prompt flows, Commander flags, MCP contracts, and AJV validation in one go. Prefer this over ad-hoc `args`/`options` whenever you can.

#### Base fields

```ts
import {s} from "@tsed/schema";

@Commmand({
  inputSchema: () =>
    s.object({
      project: s.string().description("Absolute path").default("."),
      install: s.boolean().default(true)
    });
})
```

#### Prompts + choices + CLI flags

```ts
import {PlatformType} from "@tsed/cli-core";

@Commmand({
  inputSchema: () =>
    s.object({
      platform: s
        .enums(PlatformType)
        .default(PlatformType.EXPRESS)
        .prompt("Choose a platform")
        .choices([
          {label: "Express.js", value: PlatformType.EXPRESS},
          {label: "Fastify.js (beta)", value: PlatformType.FASTIFY}
        ])
        .opt("-p, --platform <platform>")
    });
})
```

#### Conditional prompts with `.when()`

```ts
inputSchema: () =>
  s.object({
    root: s.string().default("."),
    projectName: s
      .string()
      .prompt("Project name")
      .when((ctx) => ctx.root !== ".")
      .description("Defaults to the folder name when root is '.'")
  });
```

#### Nested arrays with grouped choices

```ts
import {FeatureType} from "@tsed/cli-core";

@Commmand({
  inputSchema: () =>
    s.object({
      features: s
        .array()
        .items(s.enums(FeatureType))
        .prompt("Select features")
        .choices([
          {
            label: "ORM",
            value: FeatureType.ORM,
            items: [
              {label: "Prisma", value: FeatureType.PRISMA},
              {label: "TypeORM", value: FeatureType.TYPEORM}
            ]
          }
        ])
    });
})
```

::: tip
Whenever a field needs CLI flags, prompts, or MCP validation, encode it in `inputSchema` using helpers like `.prompt()`, `.choices()`, `.when()`, `.opt()`, and `.items()`—it keeps every interface in sync and lets Ts.ED run AJV validation for free.
:::

## Options

The following keys exist on both APIs via `BaseCommandOptions` and apply whether you use decorators or the functional helper.

### `name`, `alias`, and `description`

The command must be uniquely named. `alias` registers short forms (`tsed ba`) and `description` feeds auto-generated help output.

### `args`

Declare positional arguments using the Commander syntax. Each entry inherits the `CommandArg` structure:

```ts
@Commmand({
  args: {
    project: {description: "Target directory", type: String, required: true},
    port: {description: "Dev server port", type: Number, defaultValue: 8080}
  }
})
```

### `options`

Flag-like options map to Commander’s `.option()` configuration and support advanced parsing:

```ts
@Commmand({
  options: {
    "--pkg-manager <name>": {
      description: "npm, pnpm, bun, yarn",
      type: String,
      customParser: (value) => value.toLowerCase()
    },
    "--feature <items...>": {
      description: "Additional generators",
      type: Array,
      itemType: String
    }
  }
})
```

### `allowUnknownOption`

Set to `true` when you want pass-through flags (useful when piping arguments to scripts or wrangling custom builders). Unknown flags are otherwise rejected with a validation error.

### `disableReadUpPkg`

By default, Ts.ED walks up the directory tree to locate a `package.json`. Set `disableReadUpPkg: true` to stop at the current working directory.

### `renderMode`

Propagates to `@tsed/cli-tasks` so you can opt into `"raw"` rendering (machine-readable logs) instead of the default interactive renderer:

```ts
renderMode: "raw";
```

## Class-specific lifecycle hooks

Class-based commands implement the `CommandProvider` interface:

- `$prompt(initial)` returns a `PromptQuestion[]` (see the Prompts guide). Use it to collect input before tasks begin.
- `$mapContext(data)` lets you coerce and normalize user input (coalescing defaults, casting strings, etc.).
- `$exec(ctx)` must return a `Task[]` (see the Tasks guide).

Because the class lives in DI, you can inject services via `inject(SomeService)` or constructor injection.

::: tip
Expose additional helpers (e.g., `protected cliFs = inject(CliFs)`) so your command stays testable with `@tsed/cli-testing`, which mocks these services automatically.
:::

## Functional API extras

The `command()` helper accepts the same option bag but swaps lifecycle hooks for plain functions:

- `prompt(initial)` mirrors `$prompt`.
- `handler(data)` replaces `$exec` and can return `Task[]` or `void`.

Use this style when you want a single-file command without DI bindings. If you later need DI, convert the handler into a class and register it with `@Command`.

## Input orchestration tips

- Prefer `inputSchema` when you need both prompt generation and MCP integration; the schema covers CLI usage, documentation, and remote calls simultaneously.
- Use `args`/`options` for plain Commander parsing, then layer `prompt` or `$prompt` to ask remaining questions interactively.
- Compose `renderMode: "raw"` with `CliCore.bootstrap({logger: {level: "info"}})` when running inside CI so task output stays structured and parsable.
