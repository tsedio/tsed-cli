#!/usr/bin/env node
import {CliCore, type PackageJson} from "@tsed/cli-core";

import pkg from "../../package.json" assert {type: "json"};
import {InteractiveWelcome} from "../commands/InteractiveWelcome.ts";

CliCore.bootstrap({
  name: "awesome",
  pkg: pkg as PackageJson,
  commands: [InteractiveWelcome],
  tools: [],
  resources: [],
  prompts: [],
  updateNotifier: false,
  checkPrecondition: false,
  logger: {
    level: process.env.DEBUG ? "debug" : "info"
  }
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
