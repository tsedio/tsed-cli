# @tsed/cli-mcp

<p style="text-align: center" align="center">
 <a href="https://tsed.dev" target="_blank"><img src="https://tsed.dev/tsed-og.png" width="200" alt="Ts.ED logo"/></a>
</p>

[![Build & Release](https://github.com/tsedio/tsed-cli/workflows/Build%20&%20Release/badge.svg?branch=master)](https://github.com/tsedio/tsed-cli/actions?query=workflow%3A%22Build+%26+Release%22)
[![npm version](https://img.shields.io/npm/v/%40tsed/cli-mcp.svg)](https://www.npmjs.com/package/@tsed/cli-mcp)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

> Model Context Protocol (MCP) server tooling for Ts.ED and the Ts.ED CLI.

This package provides:

- A lightweight bootstrapper to run an MCP server over stdio (`CLIMCPServer`).
- Simple helpers to declare MCP entities with Ts.ED DI context: `defineTool`, `defineResource`, and `definePrompt`.
- Utilities to bridge `@tsed/schema` and Zod for MCP schemas.

It can be used to expose Ts.ED CLI features to your AI client (e.g., Claude Desktop) or to build your own MCP server in a Ts.ED application or script.

## Requirements

- Node.js >= 14 (per package `engines`)
- ESM module support

## Installation

```bash
# with npm
npm i @tsed/cli-mcp
# or with yarn
yarn add @tsed/cli-mcp
# or with pnpm
pnpm add @tsed/cli-mcp
```

## Quick start

The fastest way to start an MCP server is to:

1. Define one or more tools/resources/prompts with the helpers.
2. Bootstrap the server with `CLIMCPServer.bootstrap`.

> 📚 A complete, type-checked example lives at [`docs/examples/cli/mcp-server.ts`](../../docs/examples/cli/mcp-server.ts) and is surfaced in the public docs at [cli.tsed.dev/guide/cli/mcp](https://cli.tsed.dev/guide/cli/mcp).

### 1) Define a Tool

```ts
import {defineTool} from "@tsed/cli-mcp";
import {s} from "@tsed/schema"; // or use zod directly

export const helloTool = defineTool({
  name: "hello",
  title: "Hello",
  description: "Returns a friendly greeting",
  inputSchema: s.object({name: s.string().required()}), // also supports Zod
  outputSchema: s.object({message: s.string().required()}),
  async handler({name}) {
    return {
      content: [],
      structuredContent: {message: `Hello, ${name}!`}
    };
  }
});
```

### 2) Define a Resource (optional)

```ts
import {defineResource} from "@tsed/cli-mcp";

export const configResource = defineResource({
  name: "config",
  uri: "config://app",
  title: "Application Config",
  description: "Current app configuration",
  mimeType: "text/plain",
  handler(uri) {
    return {
      contents: [
        {
          uri: uri.href,
          text: "App configuration here"
        }
      ]
    };
  }
});
```

### 3) Define a Prompt (optional)

```ts
import {definePrompt} from "@tsed/cli-mcp";
import {z} from "zod";

export const reviewPrompt = definePrompt({
  name: "review-code",
  title: "Code review",
  description: "Review code for best practices and potential issues",
  argsSchema: z.object({code: z.string()}),
  handler: ({code}) => ({
    messages: [
      {
        role: "user",
        content: {type: "text", text: `Please review this code:\n\n${code}`}
      }
    ]
  })
});
```

### 4) Bootstrap the MCP server (stdio)

```ts
import {CLIMCPServer} from "@tsed/cli-mcp";
import type {TokenProvider} from "@tsed/di";
import {helloTool} from "./tools/helloTool";
import {configResource} from "./resources/configResource";
import {reviewPrompt} from "./prompts/reviewPrompt";

await CLIMCPServer.bootstrap({
  name: "my-mcp-server",
  version: "0.0.0",
  tools: [helloTool],
  resources: [configResource],
  prompts: [reviewPrompt]
});
```

The server will start over stdio using `@modelcontextprotocol/sdk`'s `StdioServerTransport`. You can then register it in any MCP-compatible client.

## Using with Ts.ED CLI

The Ts.ED CLI ships a binary that exposes CLI features over MCP using this package. Once installed, you can run:

```bash
npx tsed-mcp
```

One built‑in example tool is `generate-file`, which leverages the CLI generators:

```ts
import {defineTool} from "@tsed/cli-mcp";
import {object, string, array, number} from "@tsed/schema";
import {inject} from "@tsed/di";
import {CliProjectService} from "@tsed/cli";
import {CliTemplatesService} from "@tsed/cli";

export const generateTool = defineTool({
  name: "generate-file",
  title: "Generate file",
  description: "Generate a new Ts.ED provider class depending on the given parameters.",
  inputSchema: object({
    type: string().required(),
    name: string().required(),
    route: string(),
    directory: string(),
    templateType: string(),
    middlewarePosition: string()
  }),
  outputSchema: object({
    files: array().items(string()),
    count: number()
  }),
  async handler(args) {
    const project = inject(CliProjectService);
    const templates = inject(CliTemplatesService);
    // map args to template options, render and transform files...
    await project.createFromTemplate(args.type as any, args as any);
    await project.transformFiles(args as any);
    return {content: [], structuredContent: {files: templates.renderedFiles, count: templates.renderedFiles.length}};
  }
});
```

## API Overview

- `defineTool(options)`
  - Registers an MCP tool inside Ts.ED DI and ensures the handler runs inside a `DIContext`.
  - Accepts `inputSchema`/`outputSchema` as `@tsed/schema` or Zod. `@tsed/schema` is automatically converted to Zod.
- `defineResource(options)`
  - Registers an MCP resource (static `uri` or `template`) with a DI‑aware handler.
- `definePrompt(options)`
  - Registers a reusable prompt template available to clients.
- `CLIMCPServer.bootstrap(settings)`
  - Creates the Ts.ED injector, loads plugins, registers provided tools/resources/prompts, and starts MCP over stdio.

### Schema note

This package includes a small helper to convert `@tsed/schema` to Zod at runtime so you can write your schemas once:

```ts
import {s} from "@tsed/schema";
// under the hood we transform JsonSchema -> Zod for MCP SDK
```

## Configuration reference

`CLIMCPServer.bootstrap(settings: Partial<TsED.Configuration>)` supports all usual Ts.ED CLI settings plus:

- `name`: MCP server name (string)
- `version`: MCP server version (string)
- `tools`: `TokenProvider[]` returned by `defineTool`
- `resources`: `TokenProvider[]` returned by `defineResource`
- `prompts`: `TokenProvider[]` returned by `definePrompt`
- `logger.level`: log level (e.g., `info`, `debug`)

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
