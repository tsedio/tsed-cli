#!/usr/bin/env node
import {register} from "node:module";
import {join} from "node:path";
import {pathToFileURL} from "node:url";

const EXT = process.env.CLI_MODE === "ts" ? "ts" : "js";

register(pathToFileURL(join(import.meta.dirname, `../loaders/alias.hook.${EXT}`)), {
  parentURL: import.meta.dirname,
  data: {
    "@tsed/core": import.meta.resolve("@tsed/core"),
    "@tsed/di": import.meta.resolve("@tsed/di"),
    "@tsed/schema": import.meta.resolve("@tsed/schema"),
    "@tsed/cli-core": import.meta.resolve("@tsed/cli-core"),
    "@tsed/cli": import.meta.resolve("@tsed/cli")
  },
  transferList: []
});

const {Cli} = await import("../Cli.js");

Cli.bootstrap({}).catch((error) => {
  console.error(error);
  process.exit(-1);
});
