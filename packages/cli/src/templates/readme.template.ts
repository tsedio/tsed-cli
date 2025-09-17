import {defineTemplate} from "../utils/defineTemplate.js";
import type {RenderDataContext} from "@tsed/cli";
import {PackageManager} from "@tsed/cli-core";

export default defineTemplate({
  id: "readme",
  label: "Readme file",
  fileName: "README",
  outputDir: ".",
  ext: "md",
  preserveCase: true,
  hidden: true,

  render(_, context: RenderDataContext) {
    const pkgCmd = context.packageManager === PackageManager.YARN_BERRY ? "yarn" : context.packageManager;

    return `<p style="text-align: center" align="center">
  <a href="https://tsed.dev" target="_blank"><img src="https://tsed.dev/tsed-og.png" width="200" alt="Ts.ED logo"/></a>
</p>

<div align="center">
  <h1>Ts.ED - ${context.projectName}</h1>
  <br />
  <div align="center">
    <a href="https://cli.tsed.dev/">Website</a>
    <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
    <a href="https://cli.tsed.dev/getting-started.html">Getting started</a>
    <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
    <a href="https://slack.tsed.dev">Slack</a>
    <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
    <a href="https://twitter.com/TsED_io">Twitter</a>
  </div>
  <hr />
</div>

> An awesome project based on Ts.ED framework

## Getting started

> **Important!** Ts.ED requires Node >= 20.x or Bun.js and TypeScript >= 5.

\`\`\`batch
# install dependencies
$ ${pkgCmd} install

# serve
$ ${pkgCmd} start

# build for production
$ ${pkgCmd} run build
$ ${pkgCmd} run start:prod
\`\`\`

## Docker

\`\`\`
# build docker image
docker compose build

# start docker image
docker compose up
\`\`\`

## Barrels

This project uses [barrels](https://www.npmjs.com/package/@tsed/barrels) to generate index files to import the controllers.

Edit \`.barrels.json\` to customize it:

\`\`\`json
{
  "directory": [
    "./src/controllers/rest",
    "./src/controllers/pages"
  ],
  "exclude": [
    "**/__mock__",
    "**/__mocks__",
    "**/*.spec.ts"
  ],
  "delete": true
}
\`\`\`
`;
  }
});
