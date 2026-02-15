# @tsed/cli-tasks

<p style="text-align: center" align="center">
 <a href="https://tsed.dev" target="_blank"><img src="https://tsed.dev/tsed-og.png" width="200" alt="Ts.ED logo"/></a>
</p>

[![Build & Release](https://github.com/tsedio/tsed-cli/workflows/Build%20&%20Release/badge.svg?branch=master)](https://github.com/tsedio/tsed-cli/actions?query=workflow%3A%22Build+%26+Release%22)
[![TypeScript](https://badges.frapsoft.com/typescript/love/typescript.svg?v=100)](https://github.com/ellerbrock/typescript-badges/)

Terminal-friendly task runner shared by every Ts.ED CLI command. Tasks return ordered steps, receive a `TaskLogger`, and can stream child-process output without depending on Listr/Listr2.

## Documentation

- [CLI task guide](https://cli.tsed.dev/guide/cli/tasks) – explains lifecycle, progress tips, and cancellation patterns.

## Quick example

```ts
import type {Task} from "@tsed/cli-tasks";
import {execa} from "execa";

export interface DeployContext {
  projectDir: string;
  install: boolean;
  onCancel(handler: () => void): void;
}

export const deployTasks: Task<DeployContext>[] = [
  {
    title: "Install dependencies",
    skip: (ctx) => (!ctx.install ? "Skipped with --no-install" : false),
    async task(ctx, logger) {
      const subprocess = execa("npm", ["install"], {cwd: ctx.projectDir});
      ctx.onCancel(() => subprocess.kill("SIGINT"));
      subprocess.stdout?.on("data", (chunk) => logger.info(chunk.toString().trim()));
      await subprocess;
    }
  }
];
```

The snippet is lifted from the docs example above; update one file and both locations stay in sync.

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
