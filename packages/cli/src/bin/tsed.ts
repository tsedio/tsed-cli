#!/usr/bin/env node
import {register} from "node:module";
import {fileURLToPath, pathToFileURL} from "node:url";

const EXT = process.env.CLI_MODE === "ts" ? "ts" : "js";

register(pathToFileURL(`${import.meta.dirname}/../loaders/alias.hook.${EXT}`), {
  parentURL: import.meta.dirname,
  data: {
    "@tsed/core": fileURLToPath(import.meta.resolve("@tsed/core")),
    "@tsed/di": fileURLToPath(import.meta.resolve("@tsed/di")),
    "@tsed/schema": fileURLToPath(import.meta.resolve("@tsed/schema")),
    "@tsed/cli-core": fileURLToPath(import.meta.resolve("@tsed/cli-core")),
    "@tsed/cli": fileURLToPath(import.meta.resolve("@tsed/cli"))
  },
  transferList: []
});

const {Cli} = await import("../Cli.js");

Cli.bootstrap({}).catch((error) => {
  console.error(error);
  process.exit(-1);
});
