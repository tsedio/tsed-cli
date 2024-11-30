# @tsed/cli

<p style="text-align: center" align="center">
 <a href="https://tsed.dev" target="_blank"><img src="https://tsed.dev/tsed-og.png" width="200" alt="Ts.ED logo"/></a>
</p>

[![Build & Release](https://github.com/tsedio/tsed-cli/workflows/Build%20&%20Release/badge.svg?branch=master)](https://github.com/tsedio/tsed-cli/actions?query=workflow%3A%22Build+%26+Release%22)
[![npm version](https://badge.fury.io/js/%40tsed%2Fcli.svg)](https://badge.fury.io/js/%40tsed%2Fcli)
[![Known Vulnerabilities](https://snyk.io/test/github/tsedio/tsed-cli/badge.svg)](https://snyk.io/test/github/tsedio/tsed-cli)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![backers](https://opencollective.com/tsed/tiers/badge.svg)](https://opencollective.com/tsed)

> CLI for the Ts.ED framework

## Features

Please refer to the [documentation](https://cli.tsed.dev/) for more details.

## Requirement

The CLI needs at least Node.js v12 and NPM v7/8.

## Installation

```bash
npm install -g @tsed/cli
```

## Proxy configuration

Ts.ED CLI uses the npm proxy configuration.
Use these commands to configure the proxy:

```sh
npm config set proxy http://username:password@host:port
npm config set https-proxy http://username:password@host:port
```

Or you can edit directly your ~/.npmrc file:

```
proxy=http://username:password@host:port
https-proxy=http://username:password@host:port
https_proxy=http://username:password@host:port
```

> Note: The following environment variables can be also used to configure the proxy `HTTPS_PROXY`, `HTTP_PROXY`
> and `NODE_TLS_REJECT_UNAUTHORIZED`.

## Commands

```shell
Usage: tsed [options] [command]

Options:
  -V, --version                       output the version number
  -h, --help                          display help for command

Commands:
  add [options] [name]                Add cli plugin to the current project
  generate|g [options] [type] [name]  Generate a new provider class
  update [options]                    Update all Ts.ED packages used by your project
  init [options] [root]               Init a new Ts.ED project
  run [options] <command>             Run a project level command
  help [command]                      display help for commands
```

## Init project

```shell
Usage: tsed init [options] [root]

Init a new Ts.ED project

Arguments:
  root                                    Root directory to initialize the Ts.ED project (default: ".")

Options:
  -n, --project-name <projectName>        Set the project name. By default, the project is the same as the name directory. (default: "")
  -a, --arch <architecture>               Set the default architecture convention (default or feature) (default: "default")
  -c, --convention <convention>           Set the default project convention (default or feature) (default: "default")
  -p, --platform <platform>               Set the default platform for Ts.ED (express or koa) (default: "express")
  --features <features...>                List of the Ts.ED features. (default: [])
  -m, --package-manager <packageManager>  The default package manager to install the project (default: "yarn")
  -t, --tsed-version <version>            Use a specific version of Ts.ED (format: 5.x.x). (default: "latest")
  -f, --file <path>                       Location of a file in which the features are defined.
  -s, --skip-prompt                       Skip the prompt. (default: false)
  -r, --root-dir <path>                   Project root directory
  --verbose                               Verbose mode
  -h, --help                              display help for command
```

Interactive prompt:

```shell
tsed init .
```

Skip prompt:

```shell
tsed init . --platform express --package-manager yarn --features swagger,jest,eslint,lintstaged,prettier --skip-prompt
```

## Use file to generate project

A file can be defined to generate project. For example create a `tsed.template.yml` and add this code:

```yaml
projectName: project-example
platform: express
architecture: default
convention: default
skipPrompt: true
packageManager: yarn
features:
  - graphql
  - socketio
  - swagger
  - oidc
  - passportjs
  - commands
  - db
  - prisma
  - mongoose
  - typeorm
  - typeorm:mysql
  - testing
  - jest
  - mocha
  - linter
  - eslint
  - lintstaged
  - prettier
  - bundler
  - babel
  - babel:webpack
```

> Note: The CLI support `yml` and `json` file!

Then:

```shell
tsed init . --file ./tsed.template.yml
```

## Run Cli from code

```typescript
import {Cli} from "@tsed/cli";

Cli.dispatch("init", {
  //... init options
});
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

Copyright (c) 2016 - 2023 Romain Lenzotti

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
