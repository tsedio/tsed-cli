# Getting started

## CLI

The Ts.ED CLI is a command-line interface tool that you use to initialize, develop, scaffold, and maintain Ts.ED applications.

## CLI Core

This package helps TypeScript developers build their own CLI with class and decorators. To do that,
`@tsed/cli-core` uses the Ts.ED DI and its utils to declare a new Command via decorators.

`@tsed/cli-core` also provides a plugin-ready architecture. You and your community will be able to develop your official cli-plugin and deploy it on npm registry.

## CLI Plugins

CLI Plugins are npm packages that provide optional features to your Ts.ED CLI projects, such as Mocha/Jest, TSLint integration, and unit testing.
It's easy to spot a Ts.ED CLI plugin, as their names start with either `@tsed/cli-plugin-` (for built-in plugins) or `tsed-cli-plugin-` (for community plugins).

When you run the @tsed/cli binary inside your project, it automatically resolves and loads all CLI Plugins listed in your project's package.json.

Plugins can be included as part of your project creation process or added into the project later. 

## Installing CLI

Install the CLI using the npm package manager: 

```bash
npm install -g @tsed/cli
```

## Basic workflow

Invoke the tool on the command line through the tsed executable. 
Online help is available on the command line. Enter the following to list commands or options for a given command (such as generate) with a short description:

```bash
tsed -h
tsed generate -h
```

To create a Ts.ED project, create a new directory and use the following commands:

```bash
tsed init .
npm start # or yarn start
```

::: tip
The `tsed init` command will generate the project with the selected choices. Out-of-the-box, CLI support
Mocha, Jest, TSLint, Prettier, Passport, etc...
:::

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

::: tip
The following environment variables can be also used to configure the proxy `HTTPS_PROXY`, `HTTP_PROXY` and `NODE_TLS_REJECT_UNAUTHORIZED`.
:::