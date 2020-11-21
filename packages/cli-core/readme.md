# @tsed/cli-core

<p style="text-align: center" align="center">
 <a href="https://tsed.io" target="_blank"><img src="https://tsed.io/tsed-og.png" width="200" alt="Ts.ED logo"/></a>
</p>

[![Build & Release](https://github.com/TypedProject/tsed-cli/workflows/Build%20&%20Release/badge.svg?branch=master)](https://github.com/TypedProject/tsed-cli/actions?query=workflow%3A%22Build+%26+Release%22)
[![TypeScript](https://badges.frapsoft.com/typescript/love/typescript.svg?v=100)](https://github.com/ellerbrock/typescript-badges/) 
[![Package Quality](http://npm.packagequality.com/shield/@tsed/cli.png)](http://packagequality.com/#?package=@tsed/cli)
[![npm version](https://badge.fury.io/js/%40tsed%2Fcli.svg)](https://badge.fury.io/js/%40tsed%2Fcli)
[![Dependencies](https://david-dm.org/TypedProject/tsed-cli.svg)](https://david-dm.org/TypedProject/tsed-cli#info=dependencies)
[![img](https://david-dm.org/TypedProject/tsed-cli/dev-status.svg)](https://david-dm.org/TypedProject/tsed-cli/#info=devDependencies)
[![img](https://david-dm.org/TypedProject/tsed-cli/peer-status.svg)](https://david-dm.org/TypedProject/tsed-cli/#info=peerDependenciess)
[![Known Vulnerabilities](https://snyk.io/test/github/TypedProject/tsed-cli/badge.svg)](https://snyk.io/test/github/TypedProject/ts-express-decorators)

> Create your CLI with TypeScript and decorators

## Goals

This package help TypeScript developers to build your own CLI with class and decorators. To doing that,
@tsed/cli-core use the Ts.ED DI and his utils to declare a new Command via decorators.

@tsed/cli-core provide also a plugin ready architecture. You and your community will be able to develop your official cli-plugin and deploy it on npm registry.

## Features

- DI Framework (injection, configuration, etc...),
- Decorators,
- Extensible with plugins architecture.

Please refer to the [documentation](https://cli.tsed.io/) for more details.

## Installation

```bash
npm install @tsed/cli-core
```

## Getting started

Create CLI require some steps like create a package.json with the right information and create a structure directory aligned with TypeScript to be compiled correctly for a npm deployment.

Here a structure directory example:
```
.
├── lib -- Transpiled code
├── src -- TypeScript source
│   ├── bin -- binary
│   ├── commands
│   └── index.ts
├── templates -- Template files
├── package.json
├── tsconfig.json 
└── tsconfig.compile.json 
```

## Create package.json and tsconfig

The first step is to create the package.json with the following lines:

```jsonc
{
  "name": "{{name}}",
  "version": "1.0.0",
  "main": "./lib/index.js",
  "typings": "./lib/index.d.ts",
  "bin": {
    "tsed": "lib/bin/{{name}}.js"
  },
  "files": [
    "lib/bin/{{name}}.js",
    "lib/bin",
    "lib",
    "templates"
  ],
  "description": "An awesome CLI build on top of @tsed/cli-core",
  "dependencies": {
    "@tsed/cli-core": "1.3.1",
    "tslib": "1.11.1"
  },
  "devDependencies": {
    "@tsed/cli-testing": "1.3.1",
    "ts-node": "latest",
    "typescript": "latest"
  },
  "scripts": {
    "build": "tsc --build tsconfig.compile.json",
    "start:cmd:add": "cross-env NODE_ENV=development ts-node -r src/bin/{{name}}.ts add -r ./.tmp"
  },
  "engines": {
    "node": ">=8.9"
  },
  "peerDependencies": {}
}
```

Then create tsconfig files one for the IDE (`tsconfig.json`):

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "es2016",
    "sourceMap": true,
    "declaration": false,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "moduleResolution": "node",
    "isolatedModules": false,
    "suppressImplicitAnyIndexErrors": false,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "allowSyntheticDefaultImports": true,
    "importHelpers": true,
    "newLine": "LF",
    "noEmit": true,
    "lib": [
      "es7",
      "dom",
      "esnext.asynciterable"
    ],
    "typeRoots": [
      "./node_modules/@types"
    ]
  },
  "linterOptions": {
    "exclude": [
    ]
  },
  "exclude": [
  ]
}
```

And another one to compile source (`tsconfig.compile.json`):

```json
{
  "extends": "./tsconfig.compile.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "lib",
    "moduleResolution": "node",
    "declaration": true,
    "noResolve": false,
    "preserveConstEnums": true,
    "sourceMap": true,
    "noEmit": false,
    "inlineSources": true
  },
  "exclude": [
    "node_modules",
    "test",
    "lib",
    "**/*.spec.ts"
  ]
}
```

## Create the bin file

The bin file is used by npm to create your node.js executable program when you install the node_module globally.

Create a new file according to your project name (example: `name.ts`) and add this code:

```typescript
#!/usr/bin/env node
import {AddCmd, Cli} from "@tsed/cli-core";
import {resolve} from "path";

const pkg = require("../../package.json");
const TEMPLATE_DIR = resolve(__dirname, "..", "..", "templates");

async function bootstrap() {
  const cli = await Cli.bootstrap({
    name: "name", // replace by the cli name. This property will be used by Plugins command
    pkg,
    templateDir: TEMPLATE_DIR,
    commands: [
      AddCmd, // CommandProvider to install a plugin
      // then add you commands
    ]
  });

  cli.parseArgs();
}

bootstrap();
```

## Create your first command

```typescript
import {
  Command,
  ICommand, 
  ClassNamePipe, 
  OutputFilePathPipe, 
  Inject,
  RoutePipe,
  SrcRendererService
} from "@tsed/cli-core";

export interface IGenerateCmdContext {
 type: string;
 name: string;
}

@Command({
  name: "generate",
  description: "Generate a new provider class",
  args: {
    type: {
      description: "Type of the provider (Injectable, Controller, Pipe, etc...)",
      type: String
    },
    name: {
      description: "Name of the class",
      type: String
    }
  }
})
export class GenerateCmd implements ICommand {
  @Inject()
  classNamePipe: ClassNamePipe;

  @Inject()
  outputFilePathPipe: OutputFilePathPipe;

  @Inject()
  routePipe: RoutePipe;

  @Inject()
  srcRenderService: SrcRendererService;

  /**
   * Prompt use Inquirer.js to print questions (see Inquirer.js for more details)
   */
  $prompt(initialOptions: Partial<IGenerateCmdContext>) {
    return [
      {
        type: "list",
        name: "type",
        message: "Which type of provider ?",
        default: initialOptions.type,
        when: !initialOptions.type,
        choices: ["injectable", "decorator"]
      },
      {
        type: "input",
        name: "name",
        message: "Which name ?",
        when: !initialOptions.name
      }
    ];
  }
  /**
   * Map context is called before $exec and map use answers. 
   * This context will be given for your $exec method and will be forwarded to other plugins
   */
  $mapContext(ctx: Partial<IGenerateCmdContext>): IGenerateCmdContext {
    const {name = "", type = ""} = ctx;

    return {
      ...ctx,
      symbolName: this.classNamePipe.transform({name, type}),
      outputFile: `${this.outputFilePathPipe.transform({name, type})}.ts`
    } as IGenerateCmdContext;
  }
  /**
   * Perform action like generate files. The tasks returned by $exec method is based on Listr configuration (see Listr documentation on npm)
   */
  async $exec(options: IGenerateCmdContext) {
    const {outputFile, ...data} = options;

    const template = `generate/${options.type}.hbs`;
    
    return [
      {
        title: `Generate ${options.type} file to '${outputFile}'`,
        task: () =>
          this.srcRenderService.render(template, data, {
            output: outputFile
          })
      }
    ];
  }
}
```

Finally create a handlebars template in templates directory:

```hbs
import {Injectable} from "@tsed/di";

@Injectable()
export class {{symbolName}} {

}
```

## Run command in dev mode

In your package.json add the following line in scripts property:
```
{
  "start:cmd:generate": "cross-env NODE_ENV=development ts-node -r src/bin/{{name}}.ts generate -r ./.tmp"
}
```
> Note: replace {{name}} by the name of you bin file located in src/bin.

> Note 2: The option `-r ./.tmp` create a temporary directory to generate files with your command.

## More examples

Here other commands examples:

- Init a project command: https://github.com/TypedProject/tsed-cli/tree/master/packages/cli/src/commands/init/InitCmd
- Generate command: https://github.com/TypedProject/tsed-cli/tree/master/packages/cli/src/commands/generate/GenerateCmd
- Plugin example: https://github.com/TypedProject/tsed-cli/tree/master/packages/cli-plugin-mocha
- Mono repo CLI:  https://github.com/TypedProject/tsed-cli/tree/master


## Contributors

Please read [contributing guidelines here](https://tsed.io/CONTRIBUTING.html)

<a href="https://github.com/TypedProject/ts-express-decorators/graphs/contributors"><img src="https://opencollective.com/tsed/contributors.svg?width=890" /></a>


## Backers

Thank you to all our backers! 🙏 [[Become a backer](https://opencollective.com/tsed#backer)]

<a href="https://opencollective.com/tsed#backers" target="_blank"><img src="https://opencollective.com/tsed/tiers/backer.svg?width=890"></a>


## Sponsors

Support this project by becoming a sponsor. Your logo will show up here with a link to your website. [[Become a sponsor](https://opencollective.com/tsed#sponsor)]

## License

The MIT License (MIT)

Copyright (c) 2016 - 2018 Romain Lenzotti

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
